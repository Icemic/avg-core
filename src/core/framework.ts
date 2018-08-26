import * as Mobx from 'mobx';
import { observer } from 'mobx-react';
import { flow as mstFlow, types } from 'mobx-state-tree';
import 'reflect-metadata';

import Store from './store';

interface IAVGObserverDefine {
  type: 'autorun' | 'reaction' | 'when';
  params: any[];
  handlerKey: string;
}

interface IAVGPropertyDefine {
  name: string;
  type: string;
}

interface IAVGModelDefine {
  name: string;
  type: string;
}

export interface IClass {
  new(...args: any[]): any;
}
// interface AVGTarget {
//   '[[Store]]': any;
//   '[[emit]]': any;
// }

const GeneratorFunction = (function*(): any { /**/ }).constructor;
// const AsyncGeneratorFunction = (async function* (): any {}).constructor;
// const AsyncFunction = (async function () { }).constructor;

export function member() {
  return (Target: any, key: string) => {
    let AVGModelDef: IAVGModelDefine[] = Target.AVGModelDef;
    if (!AVGModelDef) {
      AVGModelDef = Target.AVGModelDef = [];
    }

    const t = Reflect.getMetadata('design:type', Target, key);
    AVGModelDef.push({
      name: key,
      type: t.name,
    });
  };
}

export function property() {
  return (Target: any, key: string) => {
    let AVGPropertyDef: IAVGPropertyDefine[] = Target.AVGPropertyDef;
    if (!AVGPropertyDef) {
      AVGPropertyDef = Target.AVGPropertyDef = [];
    }

    const t = Reflect.getMetadata('design:type', Target, key);
    AVGPropertyDef.push({
      name: key,
      type: t.name,
    });
  };
}

export function event(name: string) {
  return function handleDescriptor(
    Target: any,
    key: string,
    descriptor: PropertyDescriptor,
  ) {
    let AVGEventsDef = Target.AVGEventsDef;
    if (!AVGEventsDef) {
      AVGEventsDef = Target.AVGEventsDef = [];
    }

    AVGEventsDef.push(name);

    // const params = Reflect.getMetadata("design:paramtypes", Target, key);

    return {
      // ...descriptor,
      get() {
        return (...args: any[]) => {
          // console.log('触发了事件', name, '参数为', ...args);
          return this['[[emit]]'](name, ...args);
        };
      },
    };
  };
}

// export function store() {
//   return function handleDescriptor<T extends Class>(
//     Target: T,
//     key?: string,
//     descriptor?: PropertyDescriptor,
//   ): T {
//     return Target;
//   }
// }

export function action() {
  return function handleDescriptor(
    Target: any,
    key: string,
    descriptor: PropertyDescriptor,
  ) {
    let AVGActionsDef = Target.AVGActionsDef;
    if (!AVGActionsDef) {
      AVGActionsDef = Target.AVGActionsDef = {};
    }

    AVGActionsDef[key] = Target[key];

    return {
      // ...descriptor,
      get() {
        return this['[[Store]]'][key];
      },
    };
  };
}

export function autorun() {
  return function handleDescriptor<T>(
    Target: any,
    key: string,
    descriptor: PropertyDescriptor,
  ) {
    let AVGObserversDef: IAVGObserverDefine[] = Target.AVGObserversDef;
    if (!AVGObserversDef) {
      AVGObserversDef = Target.AVGObserversDef = [];
    }

    AVGObserversDef.push({
      type: 'autorun',
      params: [],
      handlerKey: key,
    });
  };
}
export function reaction(name: string | string[]) {
  return function handleDescriptor<T>(
    Target: any,
    key: string,
    descriptor: PropertyDescriptor,
  ) {
    let names: string[];
    if (typeof name === 'string') {
      names = [name];
    } else {
      names = name;
    }

    let AVGObserversDef: IAVGObserverDefine[] = Target.AVGObserversDef;
    if (!AVGObserversDef) {
      AVGObserversDef = Target.AVGObserversDef = [];
    }

    AVGObserversDef.push({
      type: 'reaction',
      params: names,
      handlerKey: key,
    });
  };
}
export function when(name: string) {
  return function handleDescriptor<T>(
    Target: any,
    key: string,
    descriptor: PropertyDescriptor,
  ) {
    let AVGObserversDef: IAVGObserverDefine[] = Target.AVGObserversDef;
    if (!AVGObserversDef) {
      AVGObserversDef = Target.AVGObserversDef = [];
    }

    AVGObserversDef.push({
      type: 'when',
      params: [name],
      handlerKey: key,
    });
  };
}

export const computed = Mobx.computed;
export const flow = mstFlow;

export function defineAsPlugin() {
  return function handleDescriptor<T extends IClass>(
    Target: T,
    key?: string,
    descriptor?: PropertyDecorator,
  ): T {
    return Target;
  };
}

/* connect */

export interface IHandlerObject {
  eventName: string;
  // handlers: (IHandlerDirect | IHandlerIndirect)[];
  handlers: IHandlerIndirect[];
}
// export interface IHandlerDirect {
//   action: string;
//   type: 'direct';
//   data: string;
// }
export interface IHandlerIndirect {
  action: string;
  type: 'indirect';
  data: {
    input: {
      [name: string]: string,
    },
    expression: string,
  };
}

// It's not the accurate defination
export interface IModel {
  [key: string]: any;
}

export const globalStore = new Store();

export function connect(asType: 'plugin' | 'component', toName: string, handlerObjects: IHandlerObject[] = []) {
  return function handleDescriptor<T extends IClass>(
    Target: T,
    key?: string,
    descriptor?: PropertyDecorator,
  ): T {
    const eventNames = (Target as any).prototype.AVGEventsDef || [];
    const emitFunc = genEmitFunction(eventNames, handlerObjects);

    class AVGTarget extends Target {
      protected '[[Store]]': any;
      protected '[[emit]]' = emitFunc;
      constructor(...args: any[]) {
        super(...args);

        const AVGModelDef: IAVGModelDefine[] = Target.prototype.AVGModelDef || [];
        const defualtValue: any = {};
        const schema: any = {};
        for (const modelDef of AVGModelDef) {
          const { name, type } = modelDef;
          let mstType;
          switch (type) {
            case 'String': mstType = types.string; break;
            case 'Number': mstType = types.number; break;
            case 'Boolean': mstType = types.boolean; break;
            case 'Object': mstType = types.frozen; break;
            case 'Array': mstType = types.frozen; break;
            default: // console.error(`Unrecognized model type '${type}'`);
          }
          schema[name] = mstType;

          defualtValue[name] = this[name];

          Object.defineProperty(this, name, {
            set(value) {
              this['[[Store]]'][name] = value;
            },
            get() {
              return this['[[Store]]'][name];
            },
          });
        }

        const model = types
          .model(schema)
          .actions((self) => {
            const AVGActionsDef = Target.prototype.AVGActionsDef || {};
            const ret: typeof AVGActionsDef = {};
            for (const actionKey in AVGActionsDef) {
              const bindedFunc = AVGActionsDef[actionKey].bind(this);
              let func = bindedFunc;
              if (func.constructor === GeneratorFunction) {
                func = flow(bindedFunc);
              }
              ret[actionKey] = func;
            }
            return ret;
          });

        const store = model.create(defualtValue);
        this['[[Store]]'] = store;

        globalStore.set(toName, store);

        const AVGObserversDef: IAVGObserverDefine[] = Target.prototype.AVGObserversDef || [];
        for (const observerDef of AVGObserversDef) {
          const { type, params, handlerKey } = observerDef;
          if (type === 'reaction') {
            for (const name of params) {
              Mobx.reaction(() => (this['[[Store]]'] as any)[name], this[handlerKey].bind(this));
            }
          } else if (type === 'autorun') {
            Mobx.autorun(this[handlerKey].bind(this));
          } else if (type === 'when') {
            Mobx.when(() => (this['[[Store]]'] as any)[params[0]], this[handlerKey].bind(this));
          }
        }
      }
    }

    if (asType === 'plugin') {
      return AVGTarget;
    } else if ((Target as React.ComponentClass).prototype.isReactComponent) {
      return observer(AVGTarget);
    }
    return AVGTarget;
  };
}

function genEmitFunction(eventNames: string[], handlerObjects: IHandlerObject[]) {
  return async function emit(name: string, ...args: any[]) {
    if (eventNames.includes(name)) {
      for (const handlerObject of handlerObjects) {
        const eventName = handlerObject.eventName;
        if (eventName !== name) {
          continue;
        }
        // construct event object
        let passed = false;
        let terminated = false;
        const evt = {
          args,
          pass() {
            passed = true;
          },
          terminate() {
            terminated = true;
          },
        };
        const handlers = handlerObject.handlers;
        for (const handler of handlers) {
          const { action: actionFullName, type, data } = handler;
          const [key, value] = actionFullName.split('.');
          const instance = globalStore.get(key);
          if (instance) {
            const funcArgs = functionGenerator(data)(evt);
            if (!passed) {
              await (instance as IModel)[value](funcArgs);
            }
          }
          if (terminated) {
            break;
          }
          passed = false;
        }
      }
    }
  };
}

// use https://github.com/caiogondim/fast-memoize.js to optimize performance?
function functionGenerator(data: any): (...arg: any[]) => any {
  const inputs = data.input;
  const values: any[] = [];
  const argNames: string[] = [];
  for (const inputKey in inputs) {
    argNames.push(inputKey);
    const [key, value] = inputs[inputKey].split('.');
    values.push(() => {
      const instance = globalStore.get(key);
      if (instance) {
        return (instance as IModel)[value];
      }
    });
  }
  const func = new Function('evt', ...argNames, data.expression);
  return (evt) => func(evt, ...values.map((item) => item()));
}
