import deepEqual from 'deep-equal';
import core from '../core/core';
import Logger from '../core/logger';
import ContainerMixin from './ContainerMixin';
import NodeMixin from './NodeMixin';

const logger = Logger.create('BaseComponent');

const EMPTY_NODE = new PIXI.DisplayObject();

export interface IBaseProperties {
  name?: string;
  src?: string;
  alpha?: boolean;
  visible?: boolean;
  cacheAsBitmap?: boolean;
  buttonMode?: boolean;
  x?: number;
  y?: number;
  position?: {
    0: number;
    1: number;
  };
  width?: number;
  height?: number;
  size?: {
    0: number;
    1: number;
    length: 2;
  };
  pivot?: {
    0: number;
    1: number;
  };
  anchor?: {
    0: number;
    1: number;
  };
  rotation?: number;
  scale?: {
    0: number;
    1: number;
  };
  skew?: {
    0: number;
    1: number;
  };
  tint?: number | string;

  children?: any;
}

export default abstract class BaseComponent<Node extends PIXI.DisplayObject, P extends IBaseProperties> {
  protected construct!: (...args: any[]) => any;
  protected node: Node = EMPTY_NODE as Node;
  protected _renderedChildren: any[] | null = null;
  protected _mostRecentlyPlacedChild: any | null = null;

  // fake guys, a hack for fiting BaseComponent to React.Component
  public get props(): P {
    throw new Error(genErrorMessage(this.displayName, 'props'));
  }
  public get state(): {} {
    throw new Error(genErrorMessage(this.displayName, 'state'));
  }
  public get context(): {} {
    throw new Error(genErrorMessage(this.displayName, 'context'));
  }
  public get refs(): {} {
    throw new Error(genErrorMessage(this.displayName, 'refs'));
  }
  public setState() {
    throw new Error(genErrorMessage(this.displayName, 'setState'));
  }
  public forceUpdate() {
    throw new Error(genErrorMessage(this.displayName, 'forceUpdate'));
  }
  public render(): null {
    throw new Error(genErrorMessage(this.displayName, 'render'));
  }

  protected displayName = 'Unknown';
  constructor(element: React.ReactElement<P>) {
    this.construct(element);
  }
  /**
   * Set value for PIXI.DisplayObject
   *
   * 1. value === undefined && defaultValue !== undefined: set node[key] to defaultValue
   * 2. value === undefined && defaultValue === undefined: do nothing
   * 3. value !== undefined: set node[key] to value
   *
   * @param {string} key
   * @param {any} value
   * @param {any} defaultValue
   */
  protected setValue(key: keyof P, value: any, defaultValue?: any) {
    const node = this.node as any;

    if (value === undefined) {
      if (defaultValue === undefined) {
        // do nothing
      } else {
        node[key] = defaultValue;
      }
    } else if (key === 'src') {
      node.src = core.getTexture(value);
    } else if (['position', 'pivot', 'anchor', 'rotation', 'scale', 'skew'].includes(key.toString())) {
      node[key] = convertToPixiValue(value);
    } else {
      node[key] = value;
    }
  }

  /**
   * update value for PIXI.DisplayObject, if prevValue !== value, update will be executed.
   *
   * @param {string} key
   * @param {any} prevValue
   * @param {any} value
   */
  protected updateValue(key: keyof P, prevValue: any, value: any) {
    if (!deepEqual(prevValue, value)) {
      this.setValue.call(this, key, value);
    }
  }

  /**
   * Apply props to PIXI.DisplayObject
   *
   * @param {PIXI.DisplayObject} node
   * @param {object} props
   */
  public mountNode(props: P) {
    this.setValue('name', props.name);
    this.setValue('src', props.src);

    this.setValue('alpha', props.alpha);
    this.setValue('visible', props.visible);
    this.setValue('cacheAsBitmap', props.cacheAsBitmap);
    this.setValue('buttonMode', props.buttonMode);

    this.setValue('x', props.x);
    this.setValue('y', props.y);
    this.setValue('position', props.position);

    this.setValue('width', props.width);
    this.setValue('height', props.height);
    this.setValue('width', props.size && props.size.length === 2 && props.size[0]);
    this.setValue('height', props.size && props.size.length === 2 && props.size[1]);

    this.setValue('pivot', props.pivot);
    this.setValue('anchor', props.anchor);

    this.setValue('rotation', props.rotation);
    this.setValue('scale', props.scale);
    this.setValue('skew', props.skew);
    this.setValue('tint', props.tint);
  }

  public updateNode(prevProps: P, props: P) {
    this.updateValue('name', prevProps.name, props.name);
    this.updateValue('src', prevProps.src, props.src);

    this.updateValue('alpha', prevProps.alpha, props.alpha);
    this.updateValue('visible', prevProps.visible, props.visible);
    this.updateValue('cacheAsBitmap', prevProps.cacheAsBitmap, props.cacheAsBitmap);
    this.updateValue('buttonMode', prevProps.buttonMode, props.buttonMode);

    this.updateValue('x', prevProps.x, props.x);
    this.updateValue('y', prevProps.y, props.y);
    this.updateValue('position', prevProps.position, props.position);

    this.updateValue('width', prevProps.width, props.width);
    this.updateValue('height', prevProps.height, props.height);
    this.updateValue('width', prevProps.size && prevProps.size.length === 2 && prevProps.size[0],
      props.size && props.size.length === 2 && props.size[0]);
    this.updateValue('height', prevProps.size && prevProps.size.length === 2 && prevProps.size[1],
      props.size && props.size.length === 2 && props.size[1]);

    this.updateValue('pivot', prevProps.pivot, props.pivot);
    this.updateValue('anchor', prevProps.anchor, props.anchor);

    this.updateValue('rotation', prevProps.rotation, props.rotation);
    this.updateValue('scale', prevProps.scale, props.scale);
    this.updateValue('skew', prevProps.skew, props.skew);
    this.updateValue('tint', prevProps.tint, props.tint);
  }

  public unmountNode() {
    // no-op
  }

}

function genErrorMessage(component: string, method: string) {
  return `There's only fake ${method} in Component '${component}' to fit type defination. DO NOT try to get or set it.`;
}

const mixins = [ContainerMixin, NodeMixin] as any[];

for (let i = 0, l = mixins.length; i < l; i++) {
  let mixin = mixins[i];
  if (mixin.prototype) {
    const _mixin: { [key: string]: any } = {};
    Object.getOwnPropertyNames(mixin.prototype).forEach((funcName) => {
      _mixin[funcName] = mixin.prototype[funcName];
    });
    mixin = _mixin;
  }
  Object.assign(BaseComponent.prototype, wrapNodeLifeCycle(mixin));
}

function wrapNodeLifeCycle(lifeCycle: { [key: string]: (...args: any[]) => any }) {
  const ret: { [key: string]: (...args: any[]) => any } = {};

  const {
    createNode,
    mountNode,
    updateNode,
    unmountNode } = lifeCycle;

  if (lifeCycle.createNode) {
    ret.createNode = function() {
      createNode.call(this);
      core.emit('createNode', this.node);
    };
  }
  if (lifeCycle.mountNode) {
    ret.mountNode = function(props) {
      core.emit('mountNode', this.node, props);

      return mountNode.call(this, props);
    };
  }
  if (lifeCycle.updateNode) {
    ret.updateNode = function(prevProps, props) {
      core.emit('updateNode', this.node, prevProps, props);

      return updateNode.call(this, prevProps, props);
    };
  }
  if (lifeCycle.unmountNode) {
    ret.unmountNode = function() {
      core.emit('unmountNode', this.node);

      return unmountNode.call(this);
    };
  }

  return Object.assign({}, lifeCycle, ret);
}

/**
 * Convert pure array to proper Pixi Object, non-array will be returned as-is.
 *
 * Array[2] --> PIXI.Point
 *
 * Array[4] --> PIXI.Rectangle
 *
 * Array[9] --> PIXI.Matrix
 *
 *
 * @param {any} value
 * @return {any}
 */
function convertToPixiValue(value: any) {
  if (value instanceof Array) {
    if (value.length === 2) {
      return new PIXI.Point(value[0], value[1]);
    } else if (value.length === 4) {
      return new PIXI.Rectangle(value[0], value[1], value[2], value[3]);
    } else if (value.length === 9) {
      const matrix = new PIXI.Matrix();
      matrix.fromArray(value);
      return matrix;
    }
    logger.warn(`Unrecognized array: ${value}`);

    return value;
  }

  return value;
}
