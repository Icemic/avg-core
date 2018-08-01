import deepEqual from 'deep-equal';
import { attachToSprite } from '../classes/EventManager';
import core from '../core/core';
import { ReactUpdates } from './reactdom';

const logger = core.getLogger('NodeMixin');

const NodeMixin = {
  // fill it to avoid throw error (occurs when using react devtools)
  _hostNode: {},
  construct(element: any) {
    this._currentElement = element;

    this.createNode(element);
    if (!this.node) {
      logger.error('`this.node` is null, you should init it at `this.createNode`');
    }

    // bind event handlers
    attachToSprite(this.node);
    this.node.__avg__ = true;
    // Avoid reset buttonMode value setting in `mountNode()`
    this.node.buttonMode = this.node.buttonMode || false;
    const keys = Object.keys(element.props);

    for (const key of keys) {
      if (/^on[A-Z]/.test(key)) {
        if (key === 'onClick' && element.props.buttonMode !== false) {
          this.node.buttonMode = true;
        }
        this.node[`_on${key.replace(/^on/, '').toLowerCase()}`] = element.props[key];
      }
    }
  },

  getPublicInstance() {
    return this.node;
  },

  mountComponentIntoNode(/* rootID, container */) {
    throw new Error(
      'You cannot render a Canvas component standalone. '
      + 'You need to wrap it in a Surface.',
    );
  },

  getHostNode(/* ...props */) {
    // React@15.0 之后新添加的东西
    // 不知道干啥用的，先放着吧……
    return this;
  },

  mountComponent(transaction: any, nativeParent: any, nativeContainerInfo: any, context: any) {
    const props = this._currentElement.props;

    const layer = this.mountNode(props);

    const _transaction = ReactUpdates.ReactReconcileTransaction.getPooled();

    _transaction.perform(
      this.mountAndInjectChildren,
      this,
      props.children,
      _transaction,
      context,
    );
    ReactUpdates.ReactReconcileTransaction.release(_transaction);

    return layer;
  },

  receiveComponent(nextComponent: any, transaction: any, context: any) {
    const prevProps = this._currentElement.props;
    const props = nextComponent.props;

    if (!deepEqual(prevProps, props)) {
      this.updateNode(prevProps, props);

      const prevKeys = Object.keys(prevProps);

      for (const key of prevKeys) {
        if (/^on[A-Z]/.test(key)) {
          delete this.node[`_on${key.replace(/^on/, '').toLowerCase()}`];
        }
      }

      // Avoid reset buttonMode value setting in `mountNode()`
      this.node.buttonMode = this.node.buttonMode || false;
      const keys = Object.keys(props);

      for (const key of keys) {
        if (/^on[A-Z]/.test(key)) {
          if (key === 'onClick' && props.buttonMode !== false) {
            this.node.buttonMode = true;
          }
          this.node[`_on${key.replace(/^on/, '').toLowerCase()}`] = props[key];
        }
      }
      const _transaction = ReactUpdates.ReactReconcileTransaction.getPooled();

      _transaction.perform(
        this.updateChildren,
        this,
        props.children,
        _transaction,
        context,
      );
      ReactUpdates.ReactReconcileTransaction.release(_transaction);

      this._currentElement = nextComponent;
    }
  },

  unmountComponent() {
    // this.destroyEventListeners();
    this.unmountNode();
    this.unmountChildren();
    this.node.removeChildren();
  },

  unmountNode() {

  },
};

export default NodeMixin;
