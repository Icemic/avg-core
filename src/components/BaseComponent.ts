import core from '../core/core';
import ContainerMixin from './ContainerMixin';
import NodeMixin from './NodeMixin';

const EMPTY_NODE = new PIXI.DisplayObject();

export default class BaseComponent<P> {
  protected construct!: (...args: any[]) => any;
  protected node: PIXI.DisplayObject = EMPTY_NODE;
  protected _renderedChildren: any[] | null = null;
  protected _mostRecentlyPlacedChild: any | null = null;

  // fake guys, a hack for fiting BaseComponent to React.Component
  public get props(): P {
    throw new Error(
      `There's only fake props in Component '${this.displayName}' to fit type defination. DO NOT try to get or set it.`,
    );
  }
  public get state(): {} {
    throw new Error(
      `There's only fake state in Component '${this.displayName}' to fit type defination. DO NOT try to get or set it.`,
    );
  }
  public get context(): {} {
    const name = this.displayName;
    throw new Error(
      `There's only fake context in Component '${name}' to fit type defination. DO NOT try to get or set it.`,
    );
  }
  public get refs(): {} {
    throw new Error(
      `There's only fake refs in Component '${this.displayName}' to fit type defination. DO NOT try to get or set it.`,
    );
  }
  public setState() {
    const name = this.displayName;
    throw new Error(
      `There's only fake setState in Component '${name}' to fit type defination. DO NOT try to get or set it.`,
    );
  }
  public forceUpdate() {
    const name = this.displayName;
    throw new Error(
      `There's only fake forceUpdate in Component '${name}' to fit type defination. DO NOT try to get or set it.`,
    );
  }

  protected displayName = 'Unknown';
  constructor(element: React.ReactElement<P>) {
    // this.node = EMPTY_NODE;
    // this._mountImage = null;
    // this._renderedChildren = null;
    // this._mostRecentlyPlacedChild = null;
    this.construct(element);
  }
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
