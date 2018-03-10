import React, { Component, ClassType, ComponentClass } from 'react';
import { reaction } from 'mobx';
import { observer } from 'mobx-react/custom';
import { types, onSnapshot, getEnv, IModelType, IStateTreeNode } from 'mobx-state-tree';
import { EventEmitter } from 'eventemitter3';
import Logger from './logger';

// hack
declare module 'mobx-react/custom' {
  function observer(clazz: AVGDecoratorTarget): AVGDecoratorOutput
}

const logger = Logger.create('State Tree');

export class StateTree extends EventEmitter {
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

export interface Model {
  [key: string]: any
}
export interface ModelDefault extends Model {
}
export interface AVGFlags {
  isAVGComponent?: boolean
  isAVGFunctionalComponent?: boolean
  isAVGPlugin?: boolean
  AVGModel: IModelType<Model, FunctionMap & Model>
  AVGModelDefault: ModelDefault
  // AVGReactions: (self: object) => {},
  AVGEvents: EventsObject,
}
export interface AVGComponent extends React.ComponentClass, AVGFlags {
  // [name: number]: (...args: any[]) => any
  // new (...args: any[]): any
  isAVGComponent: true
  data: { [name: string]: any }
}
export interface AVGFunctionalComponent extends AVGFlags {
  (properties: any, context: any, emit?: any): any
  isAVGFunctionalComponent: true
}
export interface AVGPlugin extends AVGFlags {
  new (...args: any[]): any
  isAVGPlugin: true
}
export type ReactionObject = { [name: string]: { listener: () => any, handler: () => any } };
export type ReactionFunc = (self: Model, target: Model) => ReactionObject;
export interface BindOptions {
  name: string
  reactions: ReactionFunc
}
export interface EventsObject {
  [key: string]: any
}
export type HandlersList = HandlersObject[];
export interface HandlersObject {
  eventName: string,
  handlers: Handler | Handler[]
}
export interface HandlerObject {
  action: string,
  data: any
}
export type Handler = (...args: any[]) => void | HandlerObject;
export interface FunctionMap {
  [name: string]: Function;
}
export type Actions<F, K> = (self: IStateTreeNode & K) => F;
export type Views<F, K> = (self: IStateTreeNode & K) => F;


export type AVGDecoratorOutput = AVGComponent | AVGFunctionalComponent | AVGPlugin
export type AVGDecoratorTarget = ((...args: any[]) => React.ReactElement<any>) | (new (...args: any[]) => any) | React.ClassicComponentClass | React.ComponentClass | AVGDecoratorOutput

export function define<T extends Model, K extends IModelType<T, FunctionMap & T>>
  (options: {
    model?: T,
    views?: Views<FunctionMap, T>,
    actions?: Actions<FunctionMap, T>,
    // reactions?: (self: object) => {},
    events?: object
  } = {}) {

  const { model: schema = <Model>{}, views = <Views<FunctionMap, T>>(() => ({})), actions = <Actions<FunctionMap, T>>(() => ({})), /*reactions = () => ({}), */events = {} } = options;

  return function handleDescriptor<U>(_target: AVGDecoratorTarget & U, key?: string, descriptor?: PropertyDecorator): AVGDecoratorOutput & U {

    let target;
    let type = 0;
      
    // React Component
    if (_target instanceof React.Component && (<React.ComponentClass>_target).prototype.isReactComponent) {
      target = <AVGComponent>_target;
      type = 0;
      target.isAVGComponent = true;
    } else if (!isClass(_target)) {
      target = <AVGFunctionalComponent>_target;
      type = 1;
      target.isAVGFunctionalComponent = true;
    } else {
      target = <AVGPlugin>_target;
      type = 2;
      target.isAVGPlugin = true;
    }

    // if (!DATATYPE[type]) {
    //   throw TypeError('[State Tree] Unrecognized type.');
    // }

    const defualtValue: ModelDefault = Object.assign({}, schema);

    // convert [] or {} to types.frozen
    for (const key of Object.keys(schema)) {
      const item = schema[key];

      if (typeof item === 'object') {
        schema[key] = types.frozen;
      }
    }

    const model = types.model(schema).actions(actions as Actions<FunctionMap, Model>).views(views as Views<FunctionMap, Model>);

    target.AVGModel = model;
    target.AVGModelDefault = defualtValue;
    // target.AVGReactions = reactions;
    target.AVGEvents = events;

    return <AVGDecoratorOutput & U>target;
  };
}

export function connect(options: { to: string, bind?: Array<string | BindOptions>, handlers?: HandlersList, observe?: boolean }) {

  const { to, bind = [], handlers: handlersList = [], observe = true } = options;

  return function handleDescriptor<T>(_target: AVGDecoratorTarget & T, key?: string, descriptor?: PropertyDecorator): AVGDecoratorOutput & T {

    const target = <AVGDecoratorOutput>_target;

    // if (!to) {
    //   throw Error('[State Tree] Must connect to a node.');
    // }

    if (!target.isAVGComponent && !target.isAVGPlugin && !target.isAVGFunctionalComponent) {
      throw TypeError('[State Tree] Class is not a AVG Component or Plugin.');
    }

    // data map injecting to component/plugin
    const dataMap: { [name: string]: object } = {};
    let componentInstance: typeof target;
    const model = target.AVGModel;

    type IType = typeof model.Type;

    const instance: IType = model.create(target.AVGModelDefault || <Model>{}, {
      get component() {
        return componentInstance;
      }
    });

    stateTree.append(to, instance);
    // dataMap[to] = instance;

    if (target.isAVGComponent) {
      if (observe) {
        return <AVGComponent & T>observer(getWrapped(/*dataMap, */<AVGComponent>target, instance, bind, handlersList, self => {
          componentInstance = self;
        }));
      }
      return <AVGComponent & T>getWrapped(/*dataMap, */<AVGComponent>target, instance, bind, handlersList, self => {
        componentInstance = self;
      });
    } else if (target.isAVGPlugin) {
      return <AVGPlugin & T>getWrapped(/*dataMap, */<AVGPlugin>target, instance, bind, handlersList, self => {
        componentInstance = self;
      });
    } else if (target.isAVGFunctionalComponent) {
      const eventNames = Object.keys(target.AVGEvents);
      const emitFunc = genEmitFunction(eventNames, handlersList);
      return <AVGFunctionalComponent & T>(function (props, context) {
        return target(props, context, emitFunc);
      })
    }

    throw TypeError('[State Tree] Class is not a AVG Component or Plugin.');
  };
}

// export function reactionTo(name: string) {
//   return function<T>(target: (...args: any[]) => any, key: string, descriptor: TypedPropertyDescriptor<T>): (...args: any[]) => any {
//     return function () {
//       const func = descriptor.value;
//       reaction(() => )
//       descriptor.value = function () {
        
//       }
//     };
//   }
// }

export { getEnv };

function getWrapped(/*dataMap: { [key: string]: IModelType<Model, FunctionMap & Model> }, */target: AVGComponent | AVGPlugin, instance: any, bind: Array<string | BindOptions>, handlersList: HandlersList, injectSelf: (self: any) => void): AVGComponent | AVGPlugin {

  const eventNames = Object.keys(target.AVGEvents);
  
  const emitFunc = genEmitFunction(eventNames, handlersList);

  class Wrapped extends (<AVGComponent & AVGPlugin>target) {
    private _props: object
    constructor(...args: any[]) {
      super(...args);

      this._props = super.props;
      // let externalReactions = {};

      // for (const bindObj of bind) {
      //   if (typeof bindObj === 'string') {
      //     dataMap[bindObj] = <object>stateTree.getByName(bindObj);
      //   } else {
      //     const { name, reactions: reactionsFunc }: BindOptions = bindObj;
      //     const bindInstance = <object>stateTree.getByName(name);

      //     // TODO: 重名问题
      //     Object.assign(externalReactions, reactionsFunc(bindInstance, instance));
      //     dataMap[name] = bindInstance;
      //   }
      // }

      // const reactionsMap: ReactionObject = <ReactionObject>Object.assign(externalReactions, /* target.AVGReactions(instance) */{});

      // for (const funcName in reactionsMap) {
      //   const reactionFunc = reactionsMap[funcName];

      //   reaction(reactionFunc.listener, reactionFunc.handler);
      // }

      // const selfReactions: { [key: string]: () => any } = target.AVGReactions(instance);

      // for (const funcName in selfReactions) {
      //   const reactionFunc = selfReactions[funcName];

      //   reaction(reactionFunc, this.getMethod(this, funcName).bind(this));
      // }

      injectSelf(this);
    }
    // private getMethod(self: any, name: any): Function {
    //   return self[name];
    // }
    get emit() {
      return emitFunc;
    }

    get data() {
      return instance;
    }
    // get props(): object {
    //   // return { ...this._props, ...instance };
    //   return completeAssign({}, this._props, instance);
    // }
    // set props(value) {
    //   this._props = value;
    // }
  }

  return Wrapped;
}

function functionGenerator(data: any): (...arg: any[]) => any {
  const inputs = data.input;
  const values: any[] = [];
  const argNames: string[] = [];
  for (const inputKey in inputs) {
    argNames.push(inputKey);
    const [key, value] = inputs[inputKey].split('.');
    values.push(() => {
      const instance = stateTree.getByName(key);
      if (instance) {
        return (<Model>instance)[value];
      }
    });
  }
  const func = new Function('evt', ...argNames, data.expression);
  return (evt) => func(evt, ...values.map(item => item()));
}


function genEmitFunction(eventNames: string[], handlersList: HandlersList) {
  return async function emit(name: string, data: object) {
    if (eventNames.includes(name)) {

      for (const handlerList of handlersList) {
        const eventName = handlerList.eventName;
        if (eventName !== name) {
          continue;
        }
        // construct event object
        let passed = false;
        let terminated = false;
        const evt = {
          ...data,
          pass() {
            passed = true
          },
          terminate() {
            terminated = true;
          }
        }
        const handlers = handlerList.handlers;
        if (handlers instanceof Array) {
          for (const handler of handlers) {
            if (typeof handler === 'function') {
              await handler(evt);
            } else if (typeof handler === 'object') {
              const { action, data } = <HandlerObject>handler;
              const [key, value] = action.split('.');
              const instance = stateTree.getByName(key);
              if (instance) {
                const args = functionGenerator(data)(evt);
                if (!passed) {
                  await (<Model>instance)[value](args);
                }
              }
            }
            if (terminated) {
              break;
            }
            passed = false;
          }
        } else if (typeof handlers === 'function') {
          await handlers(evt);
        } else if (typeof handlers === 'object') {
          const { action, data } = <HandlerObject>handlers;
          const [key, value] = action.split('.');
          const instance = stateTree.getByName(key);
          if (instance) {
            const args = functionGenerator(data)(evt);
            if (!passed) {
              await (<Model>instance)[value](args);
            }
          }
        }
      }

    }
  }
}  

// reference:
// https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function
// https://github.com/babel/babel/issues/5640
function isClass(func: any): boolean {
  return (typeof func === 'function' 
    && /^class\s|^.*classCallCheck\(/.test(Function.prototype.toString.call(func)))
    || !((Object.getOwnPropertyDescriptor(func, 'prototype') || {}).writable);
}

// reference:
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
// function completeAssign(target: Object, ...sources: Object[]): object {
//   sources.forEach(source => {
//     let descriptors: any = Object.keys(source).reduce((descriptors: any, key) => {
//       descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
//       return descriptors;
//     }, {});

//     // Object.assign 默认也会拷贝可枚举的Symbols
//     Object.getOwnPropertySymbols(source).forEach(sym => {
//       let descriptor: PropertyDescriptor = <PropertyDescriptor>Object.getOwnPropertyDescriptor(source, sym);
//       if (descriptor.enumerable) {
//         descriptors[sym] = descriptor;
//       }
//     });
//     Object.defineProperties(target, descriptors);
//   });
//   return target;
// }