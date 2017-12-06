/**
 * @file        Layer class
 * @author      Icemic Jia <bingfeng.web@gmail.com>
 * @copyright   2015-2016 Icemic Jia
 * @link        https://www.avgjs.org
 * @license     Apache License 2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const PIXI = require('pixi.js');
import Container from './container';

/**
 * Class representing a Layer.
 * @extends PIXI.Graphics
 */
class Layer extends Container {

  constructor() {
    super();

    this.background = new PIXI.Graphics();
    this.addChild(this.background);

    const voidFilter = new PIXI.filters.VoidFilter();

    voidFilter.padding = 0;
    voidFilter.enabled = false;
    this.filters = [voidFilter];
    this.clipFilter = voidFilter;
    this.localFilterArea = null;

    this.setProperties({
      x: 0,
      y: 0,
      alpha: 1,
      visible: true,
      width: 10,
      height: 10,
      fillColor: 0x000000,
      fillAlpha: 0,
      anchor: [0, 0]
    });
  }

  // 取代下面的通过 setTimeout 进行 hack 的方式，直接 hack `filterArea` 的取值过程
  // 新设 `localFilterArea`，内部坐标全部相对于精灵本身
  // 注：该方法会破坏 `filterArea` 原有的程序逻辑
  //   （即 hack 之后，每次获得的 filterArea 会随着精灵移动而自动发生改变）
  set filterArea(rect) {
    if (rect instanceof PIXI.Rectangle) {
      const gPoint = new PIXI.Point(rect.x, rect.y);
      const lPoint = this.toLocal(gPoint);

      this.localFilterArea = new PIXI.Rectangle(lPoint.x, lPoint.y, rect.width, rect.height);
    } else {
      this.localFilterArea = null;
    }
  }

  get filterArea() {
    const localFilterArea = this.localFilterArea;

    if (localFilterArea && !this._filterAreaCache) {
      const x = localFilterArea.x;
      const y = localFilterArea.y;
      const point = this.toGlobal(new PIXI.Point(x, y));

      this._filterAreaCache = new PIXI.Rectangle(point.x, point.y, localFilterArea.width, localFilterArea.height);

      return this._filterAreaCache;
    } else if (this._filterAreaCache) {
      return this._filterAreaCache;
    }

    return null;
  }

    /**
     * Specify sprite area you wish to use in the sprite.
     * Usually you should not specify it, unless you wish to capture a part of the picture. <br>
     * This method do not take effect until {@link Sprite#execSync} is called.
     * @param {Array[]} index - the id of sprite
     * @returns {Sprite} - this
     */
  setProperties({ x, y, alpha, visible, width, height, fillColor, fillAlpha, clip }) {
    (x != null) && (this.x = x);
    (y != null) && (this.y = y);
    (alpha != null) && (this.alpha = alpha);
    (visible != null) && (this.visible = visible);
    (width != null) && (this.rectWidth = width);
    (height != null) && (this.rectHeight = height);
    (fillColor != null) && (this.fillColor = fillColor);
    (fillAlpha != null) && (this.fillAlpha = fillAlpha);
    this.clipFilter.enabled = !!clip;
    // (anchor != null) && (this.pivot = new PIXI.Point(Math.round(this.rectWidth * anchor[0]),
    // Math.round(this.rectHeight * anchor[1])));

    this.repaintBackground();

    this._filterAreaCache = null;
    this.localFilterArea = new PIXI.Rectangle(0 - this.pivot.x,
      0 - this.pivot.y,
      this.rectWidth + this.pivot.x,
      this.rectHeight + this.pivot.y);

    return this;
  }

  set fillColor(value) {
    this._fillColor = value;
  }
  get fillColor() {
    return this._fillColor;
  }

  set fillAlpha(value) {
    this._fillAlpha = value;
  }
  get fillAlpha() {
    return this._fillAlpha;
  }

  set rectWidth(value) {
    this._rectWidth = value;
  }
  get rectWidth() {
    return this._rectWidth;
  }

  set rectHeight(value) {
    this._rectHeight = value;
  }
  get rectHeight() {
    return this._rectHeight;
  }

  repaintBackground() {
    this.background.clear();
    this.background.beginFill(this._fillColor, this._fillAlpha);
    this.background.drawRect(0, 0, this._rectWidth, this._rectHeight);
    this.background.endFill();
  }

  containsPoint(...args) {
    // TODO: Problem same as .removeChildren()
    try {
      return this.background.containsPoint(...args);
    } catch (e) {
      return false;
    }
  }

  removeChildren() {
    super.removeChildren();

    /**
     * It is a bit confusing.
     * When .destroy() was called, it will call .removeChildren()
     * because of the implement of Container.destory(),
     * but that time `this.background` had been destroyed, so .addChild() will throw an error.
     *
     * TODO: find reason
     */
    try {
      this.addChild(this.background);
    } catch (e) {
      // do nothing
    }
  }

  destroy() {
    this.background.destroy();
    super.destroy();
  }

}

// TransitionPlugin(Layer);

export default Layer;
