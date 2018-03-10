// Adapted from ReactART:
// https://github.com/reactjs/react-art

import core from "../core/core";
import { ReactMultiChild } from "./reactdom";
import Surface from "./Surface";

export default class ContainerMixin {
  private node!: PIXI.Container;
  private _renderedChildren!: any[];
  private mountChildren!: (...args: any[]) => any;
  private updateChildren!: (...args: any[]) => any;
  private unmountChildren!: (...args: any[]) => any;
  /**
   * Moves a child component to the supplied index.
   *
   * @param {ReactComponent} child Component to move.
   * @param {ReactComponent} afterNode
   * @param {number} toIndex
   * @param {number} lastIndex
   * @protected
   */
  public moveChild(child: any /* , afterNode, toIndex, lastIndex */) {
    // console.log('move:', child._mountImage.filename, 'to', toIndex);
    const childNode = child._mountImage;
    const layer = this.node;
    // TODO: wrong implementation

    core.emit("moveChild", layer, childNode);

    layer.addChild(childNode);
  }

  /**
   * Creates a child component.
   *
   * @param {ReactComponent} child Component to create.
   * @param {ReactComponent} afterNode
   * @param {ReactComponent} childNode ART node to insert.
   * @protected
   */
  public createChild(child: any, afterNode: any, childNode: any) {
    // console.log('create:', childNode.filename)
    child._mountImage = childNode;
    const layer = this.node;

    core.emit("createChild", layer, childNode);

    layer.addChild(childNode);
  }

  /**
   * Removes a child component.
   *
   * @param {ReactComponent} child Child to remove.
   * @protected
   */
  public removeChild(child: any) {
    core.emit("removeChild", this.node, child._mountImage);

    this.node.removeChild(child._mountImage);
    child._mountImage.destroy();
    child._mountImage = null;
  }

  public mountAndInjectChildren(children: any, transaction: any, context: any) {
    const mountedImages = this.mountChildren(
      children,
      transaction,
      context,
    );

    // Each mount image corresponds to one of the flattened children
    let i = 0;

    for (const key in this._renderedChildren) {
      if (this._renderedChildren.hasOwnProperty(key)) {
        const child = this._renderedChildren[key];

        core.emit("mountChild", this.node, mountedImages[i]);

        child._mountImage = mountedImages[i];
        this.node.addChild(mountedImages[i]);
        // mountedImages[i].inject(this.node);
        i++;
      }
    }
  }
}

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
      Object.getOwnPropertyNames(baseCtor).forEach((name) => {
          derivedCtor.prototype[name] = baseCtor[name];
      });
  });
}

applyMixins(ContainerMixin, ReactMultiChild.Mixin);
