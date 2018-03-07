import core from 'core/core';

export default function createComponent(name) {
  function ReactAVGComponent(element) {
    this.node = null;
    // this._mountImage = null;
    this._renderedChildren = null;
    this._mostRecentlyPlacedChild = null;
    this.construct(element);
  }

  ReactAVGComponent.displayName = name;
  for (let i = 1, l = arguments.length; i < l; i++) {
    Object.assign(ReactAVGComponent.prototype, wrapNodeLifeCycle(arguments[i]));
  }

  return ReactAVGComponent;
}

function wrapNodeLifeCycle(lifeCycle) {
  const ret = {};

  const { createNode, mountNode, updateNode, unmountNode } = lifeCycle;

  if (lifeCycle.createNode) {
    ret.createNode = function () {
      createNode.call(this);
      core.emit('createNode', this.node);
    };
  }
  if (lifeCycle.mountNode) {
    ret.mountNode = function (props) {
      core.emit('mountNode', this.node, props);

      return mountNode.call(this, props);
    };
  }
  if (lifeCycle.updateNode) {
    ret.updateNode = function (prevProps, props) {
      core.emit('updateNode', this.node, prevProps, props);

      return updateNode.call(this, prevProps, props);
    };
  }
  if (lifeCycle.unmountNode) {
    ret.unmountNode = function () {
      core.emit('unmountNode', this.node);

      return unmountNode.call(this);
    };
  }

  return Object.assign({}, lifeCycle, ret);
}
