import core from '../core/core';

export default function createComponent(name: string, ...mixins: any[]): any {
  class ReactAVGComponent {
    private construct!: (...args: any[]) => any;
    private node!: PIXI.Container | null;
    private _renderedChildren!: any[] | null;
    private _mostRecentlyPlacedChild!: any | null;

    public displayName = name;
    constructor(...args: any[]) {
      this.node = null;
      // this._mountImage = null;
      this._renderedChildren = null;
      this._mostRecentlyPlacedChild = null;
      this.construct(...args);
    }
  }

  for (let i = 0, l = mixins.length; i < l; i++) {
    let mixin = mixins[i];
    if (mixin.prototype) {
      const _mixin: { [key: string]: any } = {};
      Object.getOwnPropertyNames(mixin.prototype).forEach((funcName) => {
        _mixin[funcName] = mixin.prototype[funcName];
      });
      mixin = _mixin;
    }
    Object.assign(ReactAVGComponent.prototype, wrapNodeLifeCycle(mixin));
  }

  return ReactAVGComponent;
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
