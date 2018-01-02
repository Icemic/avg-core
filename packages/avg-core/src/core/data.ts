import React, { Component, ClassType, ComponentClass } from 'react';
import { reaction } from 'mobx';
import { observer } from 'mobx-react/custom';
import { types, onSnapshot, getEnv } from 'mobx-state-tree';
import { EventEmitter } from 'eventemitter3';
import Logger from './logger';

const logger = Logger.create('State Tree');

class StateTree extends EventEmitter {
  instanceMap: Map<string, object> = new Map<string, object>();
  append(name: string, instance: object) {
    if (this.instanceMap.has(name)) {
      logger.warn(`State instance named '${name}' exists, and has been reset.`);
    }
    this.instanceMap.set(name, instance);
  }
  getByName(name: string) {
    return this.instanceMap.get(name);
  }
}

export const stateTree = new StateTree();

interface Model {
  [key: string]: any
}
interface AVGComponent<T> /*extends ComponentClass*/ {
  new (...args: any[]): T
  // [name: number]: (...args: any[]) => any
  isAVGComponent?: boolean
  isAVGPlugin?: boolean
  AVGModel: Model
  AVGModelDefault: Model
  AVGReactions: (self: object) => {}
  data: {[name: string]: any}
}
type ReactionObject = { [name: string]: { listener: () => any, handler: () => any } };
type ReactionFunc = (self: Model, target: Model) => ReactionObject;
interface BindOptions {
  name: string
  reactions: ReactionFunc
}

export function define(options: { model: Model, views?: (self: object) => {}, actions?: (self: Model) => any, reactions?: (self: object) => {} }) {

  const { model: schema = {}, views = () => ({}), actions = () => ({}), reactions = () => ({}) } = options;

  return function handleDescriptor<T>(_target: T, key?: string, descriptor?: PropertyDecorator): AVGComponent<typeof _target> & T {

    const target = <AVGComponent<typeof _target> & typeof _target>_target;

    // React Component
    if (target.prototype.isReactComponent) {
      target.isAVGComponent = true;
    } else {
      target.isAVGPlugin = true;
    }

    // if (!DATATYPE[type]) {
    //   throw TypeError('[State Tree] Unrecognized type.');
    // }

    const defualtValue = Object.assign({}, schema);

    // convert [] or {} to types.frozen
    for (const key of Object.keys(schema)) {
      const item = schema[key];

      if (typeof item === 'object') {
        schema[key] = types.frozen;
      }
    }

    const model = types.model(schema).actions(actions).views(views);

    target.AVGModel = model;
    target.AVGModelDefault = defualtValue;
    target.AVGReactions = reactions;

    return <AVGComponent<typeof _target> & typeof _target>target;
  };
}

export function connect(options: { to: string, bind?: Array<string | BindOptions> }) {

  const { to, bind = [] } = options;

  return function handleDescriptor<T>(_target: T, key?: string, descriptor?: PropertyDecorator): AVGComponent<typeof _target> & T {
    
    const target = <AVGComponent<typeof _target> & typeof _target>_target;

    if (!to) {
      throw Error('[State Tree] Must connect to a node.');
    }

    if (!target.isAVGComponent && !target.isAVGPlugin) {
      throw TypeError('[State Tree] Class is not a AVG Component or Plugin.');
    }

    // data map injecting to component/plugin
    const dataMap: { [name: string]: object } = {};
    let componentInstance: typeof target;
    const model = target.AVGModel;

    const instance = model.create(target.AVGModelDefault || {}, {
      get component() {
        return componentInstance;
      }
    });

    stateTree.append(to, instance);
    dataMap[to] = instance;

    if (target.isAVGComponent) {
      return <AVGComponent<typeof _target> & typeof _target>observer(getWrapped<ComponentClass>(dataMap, target, instance, bind, self => {
        componentInstance = self;
      }));
    } else if (target.isAVGPlugin) {
      return <AVGComponent<typeof _target> & typeof _target>getWrapped<any>(dataMap, target, instance, bind, self => {
        componentInstance = self;
      });
    }

    throw TypeError('[State Tree] Class is not a AVG Component or Plugin.');
  };
}

export { getEnv };

function getWrapped<T>(dataMap: { [key: string]: object }, _target: any, instance: object, bind: Array<string | BindOptions>, injectSelf: (self: any) => void): AVGComponent<typeof _target> {

  const target = <AVGComponent<typeof _target>>_target;

  class Wrapped extends target {
    constructor(...args: any[]) {
      super(...args);

      let externalReactions = {};

      for (const bindObj of bind) {
        if (typeof bindObj === 'string') {
          dataMap[bindObj] = <object>stateTree.getByName(bindObj);
        } else {
          const { name, reactions: reactionsFunc }: BindOptions = bindObj;
          const bindInstance = <object>stateTree.getByName(name);

          // TODO: 重名问题
          Object.assign(externalReactions, reactionsFunc(bindInstance, instance));
          dataMap[name] = bindInstance;
        }
      }

      const reactionsMap: ReactionObject = <ReactionObject>Object.assign(externalReactions, /* target.AVGReactions(instance) */{});

      for (const funcName in reactionsMap) {
        const reactionFunc = reactionsMap[funcName];

        reaction(reactionFunc.listener, reactionFunc.handler);
      }

      const selfReactions: { [key: string]: () => any } = target.AVGReactions(instance);

      for (const funcName in selfReactions) {
        const reactionFunc = selfReactions[funcName];

        reaction(reactionFunc, this.getMethod(this, funcName).bind(this));
      }

      injectSelf(this);
    }
    private getMethod(self: any, name: any): Function {
      return self[name];
    }
    get data() {
      return dataMap;
    }
  }

  return Wrapped;
}
