import { EventEmitter } from 'eventemitter3';
import { reaction } from 'mobx';
import { observer } from 'mobx-react/custom';
import { getEnv, IModelType, IStateTreeNode, onSnapshot, types } from 'mobx-state-tree';
import React, { ClassType, Component, ComponentClass } from 'react';
import Logger from './logger';

// hack
declare module 'mobx-react/custom' {
  function observer(clazz: AVGDecoratorTarget): AVGDecoratorOutput;
}

const logger = Logger.create('State Tree');

export class StateTree extends EventEmitter {
  public instanceMap: Map<string, { [key: string]: any }> = new Map<string, { [key: string]: any }>();
  public append(name: string, instance: { [key: string]: any }) {
    if (this.instanceMap.has(name)) {
      logger.warn(`State instance named '${name}' exists, and has been reset.`);
    }
    this.instanceMap.set(name, instance);
  }
  public getByName(name: string) {
    return this.instanceMap.get(name);
  }
}

export const stateTree = new StateTree();

export interface IModel {
  [key: string]: any;
}
export interface IModelDefault extends IModel {
}
export interface IAVGFlags {
  displayName?: string;
  isAVGComponent?: boolean;
  isAVGFunctionalComponent?: boolean;
  isAVGPlugin?: boolean;
  AVGModel: IModelType<IModel, IFunctionMap & IModel>;
  AVGModelDefault: IModelDefault;
  // AVGReactions: (self: object) => {},
  AVGEvents: IEventsObject;
}
export interface IAVGComponent extends React.ComponentClass, IAVGFlags {
  // [name: number]: (...args: any[]) => any
  // new (...args: any[]): any
  isAVGComponent: true;
  data: { [name: string]: any };
}
export interface IAVGFunctionalComponent extends IAVGFlags {
  (properties: any, context: any, emit?: any): any;
  isAVGFunctionalComponent: true;
}
export interface IAVGPlugin extends IAVGFlags {
  new (...args: any[]): any;
  isAVGPlugin: true;
}
export interface IReactionObject { [name: string]: { listener: () => any, handler: () => any }; }
export type ReactionFunc = (self: IModel, target: IModel) => IReactionObject;
export interface IBindOptions {
  name: string;
  reactions: ReactionFunc;
}
export interface IEventsObject {
  [key: string]: any;
}
export type HandlersList = IHandlersObject[];
export interface IHandlersObject {
  eventName: string;
  handlers: Handler | Handler[];
}
export interface IHandlerObject {
  action: string;
  data: any;
}
export type Handler = (...args: any[]) => void | IHandlerObject;
export interface IFunctionMap {
  [name: string]: (...args: any[]) => any;
}
export type Actions<F, K> = (self: IStateTreeNode & K) => F;
export type Views<F, K> = (self: IStateTreeNode & K) => F;

export type AVGDecoratorOutput = IAVGComponent | IAVGFunctionalComponent | IAVGPlugin;
export type AVGDecoratorTarget = ((...args: any[]) => React.ReactElement<any>) | (new (...args: any[]) => any) | React.ClassicComponentClass | React.ComponentClass | AVGDecoratorOutput;

export function define<T extends IModel, K extends IModelType<T, IFunctionMap & T>>(
  type: 'component' | 'plugin' = 'component',
  options: {
    model?: T,
    views?: Views<IFunctionMap, T>,
    actions?: Actions<IFunctionMap, T>,
    // reactions?: (self: object) => {},
    events?: object,
  } = {},
) {

  const {
    model: schema = {} as IModel,
    views = (() => ({})) as Views<IFunctionMap, T>,
    actions = (() => ({})) as Actions<IFunctionMap, T>,
    /*reactions = () => ({}), */
    events = {},
  } = options;

  return function handleDescriptor<U>(
    _target: AVGDecoratorTarget & U,
    key?: string,
    descriptor?: PropertyDecorator,
  ): AVGDecoratorOutput & U {

    let target;

    if (type === 'component') {
      if (/*_target instanceof React.Component && */(_target as React.ComponentClass).prototype.isReactComponent) {
        target = _target as IAVGComponent;
        target.isAVGComponent = true;
      } else {
        target = _target as IAVGFunctionalComponent;
        target.isAVGFunctionalComponent = true;
      }
    } else {
      target = _target as IAVGPlugin;
      target.isAVGPlugin = true;
    }

    // React Component
    // if (_target instanceof React.Component && (_target as React.ComponentClass).prototype.isReactComponent) {
    //   target = _target as IAVGComponent;
    //   target.isAVGComponent = true;
    // } else if (!(_target as any).isPlugin && !isClass(_target)) {
    //   target = _target as IAVGFunctionalComponent;
    //   target.isAVGFunctionalComponent = true;
    // } else {
    //   target = _target as IAVGPlugin;
    //   target.isAVGPlugin = true;
    // }

    // if (!DATATYPE[type]) {
    //   throw TypeError('[State Tree] Unrecognized type.');
    // }

    const defualtValue: IModelDefault = Object.assign({}, schema);

    // convert [] or {} to types.frozen
    for (const name of Object.keys(schema)) {
      const item = schema[name];

      if (typeof item === 'object') {
        schema[name] = types.frozen;
      }
    }

    const model = types
      .model(schema)
      .actions(actions as Actions<IFunctionMap, IModel>)
      .views(views as Views<IFunctionMap, IModel>);

    target.AVGModel = model;
    target.AVGModelDefault = defualtValue;
    // target.AVGReactions = reactions;
    target.AVGEvents = events;

    return target as AVGDecoratorOutput & U;
  };
}

export function connect(
  options: {
    to: string, bind?: Array<string | IBindOptions>,
    handlers?: HandlersList,
    observe?: boolean,
  }) {

  const { to, bind = [], handlers: handlersList = [], observe = true } = options;

  return function handleDescriptor<T>(
    _target: AVGDecoratorTarget & T,
    key?: string,
    descriptor?: PropertyDecorator,
  ): AVGDecoratorOutput & T {

    const target = _target as AVGDecoratorOutput;

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

    const instance: IType = model.create(target.AVGModelDefault || {} as IModel, {
      get component() {
        return componentInstance;
      },
    });

    stateTree.append(to, instance);
    // dataMap[to] = instance;

    if (target.isAVGComponent) {
      if (observe) {
        return observer(getWrapped(/*dataMap, */target as IAVGComponent, instance, bind, handlersList, (self) => {
          componentInstance = self;
        })) as IAVGComponent & T;
      }
      return getWrapped(/*dataMap, */target as IAVGComponent, instance, bind, handlersList, (self) => {
        componentInstance = self;
      }) as IAVGComponent & T;
    } else if (target.isAVGPlugin) {
      return getWrapped(/*dataMap, */target as IAVGPlugin, instance, bind, handlersList, (self) => {
        componentInstance = self;
      }) as IAVGPlugin & T;
    } else if (target.isAVGFunctionalComponent) {
      const eventNames = Object.keys(target.AVGEvents);
      const emitFunc = genEmitFunction(eventNames, handlersList);
      return ((props, context) => {
        return target(props, context, emitFunc);
      }) as IAVGFunctionalComponent & T;
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

function getWrapped(/*dataMap: { [key: string]: IModelType<Model, FunctionMap & Model> }, */target: IAVGComponent | IAVGPlugin, instance: any, bind: Array<string | IBindOptions>, handlersList: HandlersList, injectSelf: (self: any) => void): IAVGComponent | IAVGPlugin {

  const eventNames = Object.keys(target.AVGEvents);

  const emitFunc = genEmitFunction(eventNames, handlersList);

  class Wrapped extends (target as IAVGComponent & IAVGPlugin) {
    private _props: object;
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
        return (instance as IModel)[value];
      }
    });
  }
  const func = new Function('evt', ...argNames, data.expression);
  return (evt) => func(evt, ...values.map((item) => item()));
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
            passed = true;
          },
          terminate() {
            terminated = true;
          },
        };
        const handlers = handlerList.handlers;
        if (handlers instanceof Array) {
          for (const handler of handlers) {
            if (typeof handler === 'function') {
              await handler(evt);
            } else if (typeof handler === 'object') {
              const { action, data: _data } = handler as IHandlerObject;
              const [key, value] = action.split('.');
              const instance = stateTree.getByName(key);
              if (instance) {
                const args = functionGenerator(_data)(evt);
                if (!passed) {
                  await (instance as IModel)[value](args);
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
          const { action, data: _data } = handlers as IHandlerObject;
          const [key, value] = action.split('.');
          const instance = stateTree.getByName(key);
          if (instance) {
            const args = functionGenerator(_data)(evt);
            if (!passed) {
              await (instance as IModel)[value](args);
            }
          }
        }
      }

    }
  };
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
