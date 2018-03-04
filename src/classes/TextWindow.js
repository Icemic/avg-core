/**
 * @file        Textwindow sprite class
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

/* eslint-disable */
const PIXI = require('pixi.js');
// import { TransitionPlugin } from './Transition/TransitionPlugin'
// import { TransitionFilter } from './Transition/TransitionFilter'

import core from 'core/core';

/**
 * Class representing a TextWindow. <br>
 * @extends PIXI.Container
 */
export default class TextWindow extends PIXI.Container {
  constructor() {
    super();

    this.visible = false;
    this.zorder = 50;

    // this.filters = [new TransitionFilter()];

    // text layer
    this.textCanvas = document.createElement('canvas');
    this.textContext = this.textCanvas.getContext('2d');
    this.textTexture = PIXI.Texture.fromCanvas(this.textCanvas);
    this.textTexture.trim = new PIXI.Rectangle();

    this.text = '';
    this.textIndex = 0;
    this.textRendering = false;

    this.style = {
      font: 'sans-serif',
      size: 24,
      color: '#ffffff',
      bold: false,
      italic: false,
      strike: false,
      underline: false,
      shadow: false,
      shadowColor: '#000000',
      stroke: false,
      strokeColor: '#000000',
      xInterval: 0,
      yInterval: 12,
    };

    this.textSpeed = 20;    // characters per second

    this.textRectangle = [20, 55, 1008, 231];

    this.m_currentTextWidth = 0;
    this.m_currentTextHeight = 0;

    this.m_lastTime = 0;

    this.m_resolve = null;

    this.resolution = 1;

    this.textSprite = new PIXI.Sprite(this.textTexture);
    this.textSprite.x = this.textRectangle[0];
    this.textSprite.y = this.textRectangle[1];

    this.addChildAt(this.textSprite, this.children.length);
  }

    /**
     * Specify index.
     * @method setIndex
     * @param {number} index - the id of TextWindow
     * @returns {TextWindow} - this
     */
  setIndex(index) {
    this.index = index;
  }

    /**
     * Specify background image.
     *   Background can only be image or color, and cannot be both.
     * @method setBackgroundFile
     * @param {string} filename
     * @returns {TextWindow} - this
     */
  setBackgroundFile(filename) {
    this.removeChild(this.background);
    this.background && this.background.destroy();
    if (filename) {
      this.background = new PIXI.Sprite(core.getTexture(filename));
      this.addChildAt(this.background, 0);
    } else {
      this.background = null;
    }
  }

    /**
     * Specify background color.
     *   Background can only be image or color, and cannot be both.
     * @method setBackgroundColor
     * @param {string} color
     * @returns {TextWindow} - this
     */
  setBackgroundColor(color) {
    this.removeChild(this.background);
    this.background && this.background.destroy();
    if (color) {
      this.background = new PIXI.Graphics();

            /* 绘制*/
      const rect = this.textRectangle;

      this.background.beginFill(color, 1.0).drawRect(rect[0], rect[1], rect[2], rect[3]);
      this.addChildAt(this.background, 0);
    } else {
      this.background = null;
    }
  }

    /**
     * Specify background opacity of the textwindow.
     * @method setOpacity
     * @param {number} opacity - value between 0 - 1.0
     * @returns {TextWindow} - this
     */
  setOpacity(value) {
    (this.background) && (this.background.alpha = value);
  }

    /**
     * Specify coordinate relative to its parent.
     * @method setPosition
     * @param {Array} position - [x, y]
     * @returns {TextWindow} - this
     */
  setPosition(pos) {
    this.x = pos[0];
    this.y = pos[1];
  }

    /**
     * Specify the area text can be rendered to.
     * @method setTextRectangle
     * @param {Array} position - [x, y, width, height]
     * @returns {TextWindow} - this
     */
  setTextRectangle(rect) {
    this.textRectangle = rect;
    this.textSprite.x = this.textRectangle[0];
    this.textSprite.y = this.textRectangle[1];
    this.initTextRender(true);
  }

    /**
     * Specify intervals between letters.
     * @method setXInterval
     * @param {number} value, px.
     * @returns {TextSprite} - this
     */
  setXInterval(value = 0) {
    this.style.xInterval = value;
  }

    /**
     * Specify intervals between lines.
     * @method setYInterval
     * @param {number} value, px.
     * @returns {TextSprite} - this
     */
  setYInterval(value = 12) {
    this.style.yInterval = value;
  }

    /**
     * Show or hide textwindow.
     * @method setVisible
     * @param {boolean} enable if no value passes, it will be a switch.
     * @returns {TextSprite} - this
     */
  setVisible(value = false) {
    if (typeof value === 'undefined') { this.visible = !this.visible; } else { this.visible = !!value; }
  }

    /**
     * @method setTextSize
     * @param {number} value
    */
  setTextSize(value = 24) {
    this.style.size = value;
  }

    /**
     * @method setTextFont
     * @param {string} name
    */
  setTextFont(name = 'sans-serif') {
    this.style.font = name;
  }

    /**
     * @method setTextColor
     * @param {number} color
    */
  setTextColor(color = '#ffffff') {
    this.style.color = color;
  }

    /**
     * @method setTextBold
     * @param {boolean} value
    */
  setTextBold(bool) {
    if (typeof bool === 'undefined') { this.style.bold = !this.style.bold; } else { this.style.bold = !!bool; }
  }

    /**
     * @method setTextItalic
     * @param {boolean} enable if no value passes, it will be a switch.
    */
  setTextItalic(bool) {
    if (typeof bool === 'undefined') { this.style.italic = !this.style.italic; } else { this.style.italic = !!bool; }
  }

    /**
     * @method setTextStrike
     * @param {boolean} enable if no value passes, it will be a switch.
    */
  setTextStrike(bool) {
    if (typeof bool === 'undefined') { this.style.strike = !this.style.strike; } else { this.style.strike = !!bool; }
  }

    /**
     * @method setTextUnderline
     * @param {boolean} enable if no value passes, it will be a switch.
    */
  setTextUnderline(bool) {
    if (typeof bool === 'undefined') { this.style.underline = !this.style.underline; } else { this.style.underline = !!bool; }
  }

    /**
     * @method setTextShadow
     * @param {boolean} enable
     * @param {string} color
    */
  setTextShadow(bool, color) {
    this.style.shadow = !!bool;
    this.style.shadowColor = color || this.style.shadowColor || '#000000';
  }

    /**
     * @method setTextStroke
     * @param {boolean} enable
     * @param {string} color
    */
  setTextStroke(bool, color) {
    this.style.stroke = !!bool;
    this.style.strokeColor = color || this.style.strokeColor || '#000000';
  }

    /**
     * Specify the speed of letters printing.
     * @method setTextSpeed
     * @param {number} value - letters per second.
    */
  setTextSpeed(value = 20) {
    this.textSpeed = value;
  }

    /**
     * Clone a new TextWindow.
     * @method clone
     * @returns {TextSprite} - clone object.
    */
  clone() {
    return clone(this);
  }

    /**
     * @method setTextCursor
     * @param {Object.Sprite} sprite
     * @param {boolean} follow - follow the last letter, or it is fixed.
     * @param {Array} [position] - must be defined if follow is false.
     */
  setTextCursor(sprite, follow, pos) {
    this.textCursor = sprite;
    this.addChildAt(this.textCursor, this.children.length);
    this.textCursorFollow = !!follow;
    if (!follow) {
      sprite.x = pos[0];
      sprite.y = pos[1];
    }
  }

    /**
     * Specify the location that the next letter will be printed.
     * @method relocate
     * @param {Number} x - x-coordinate, set to null if you don't want to change it.
     * @param {Number} y - y-coordinate, set to null if you don't want to change it.
     */
  relocate(x, y) {
    this.m_currentTextWidth = x || this.m_currentTextWidth;
    this.m_currentTextHeight = y || this.m_currentTextHeight;

    if (this.textCursor && this.textCursorFollow) {
      this.textCursor.x = this.m_currentTextWidth;
      this.textCursor.y = this.m_currentTextHeight;
    }
  }

    // text printing

    /**
     * switch next new line
     * @method newline
     */
  newline() {
    this.m_currentTextWidth = 0;
    this.m_currentTextHeight += this.style.size * this.resolution + this.style.yInterval * this.resolution;
  }

    /**
     * draw text
     * @method drawText
     * @param  {String} text what you want to print
     */
  drawText(text, clear = true) {
    if (clear) {
      this.text = text;
    } else {
      this.text += text;
    }
    this.initTextRender(clear);

    return this.wait();
  }

    /**
     * clear all text in textwindow
     * @method clearText
     */
  clearText() {
    this.textCanvas.width = this.textCanvas.width;
  }

  completeText() {
    this.m_lastTime = -99999999;
    if (this.textRendering) {
      return this.wait();
    }

    return null;
  }

    /**
     * called before draw a text
     * @method initTextRender
     * @private
     */
  initTextRender(clear) {
    if (clear) {
      this.textCanvas.width = this.textRectangle[2] * this.resolution;
      this.textCanvas.height = this.textRectangle[3] * this.resolution;
    }
        // this.textContext.clear();

        // set text style
    this.textContext.textBaseline = 'top';
    {
      let style = '';

      if (this.style.bold) { style += 'bold '; }
      if (this.style.italic) { style += 'italic '; }
      if (!style.length) { style = 'normal '; }
      this.textContext.font = `${style + this.style.size * this.resolution}px ${this.style.font}`;
    }
    this.textContext.fillStyle = (typeof this.style.color === 'number') ? (`#${this.style.color.toString(16)}`) : this.style.color;

    if (this.style.shadow) {
      this.textContext.shadowBlur = 0;
      this.textContext.shadowOffsetX = this.style.size * this.resolution / 12 * 0.414;
      this.textContext.shadowOffsetY = this.style.size * this.resolution / 12 * 0.414;
      this.textContext.shadowColor = (typeof this.style.shadowColor === 'number') ? (`#${this.style.shadowColor.toString(16)}`) : this.style.shadowColor;
    }

    if (this.style.stroke) {
      this.textContext.strokeStyle = (typeof this.style.strokeColor === 'number') ? (`#${this.style.strokeColor.toString(16)}`) : this.style.strokeColor;
      this.textContext.lineWidth = this.style.size * this.resolution / 24;
    }

        // reset status variables
    this.textRendering = true;
    this.m_lastTime = Date.now();

    if (clear) {
      this.textIndex = 0;
      this.m_currentTextWidth = 0;
      this.m_currentTextHeight = 0;
    }
  }

  async updateTransform() {
    if (!this.textRendering) {
      super.updateTransform();

      return;
    }

    const delta = Date.now() - this.m_lastTime;

    if (delta < 1000 / this.textSpeed) { return; }

    this.m_lastTime = Date.now();

    let count = Math.floor(delta / 1000 * this.textSpeed);

    if (this.textIndex + count >= this.text.length - 1) { count = this.text.length - this.textIndex; }

        // hide cursor (if exist)
    if (this.textCursor) { this.textCursor.visible = false; }

    for (let i = this.textIndex; i < this.textIndex + count; i++) {
      let character;

      if (this.text.codePointAt(i) > 0xFFFF) {
        character = this.text.at(i);
        i++;
        // if the last character is a emoji or ext-hanzi, must avoid it be cut.
        if (i === this.textIndex + count) {
          count++;
        }
      } else {
        character = this.text[i];
      }
      if (character === '\n') {
        this.newline();
        continue;
      }
            // print characters, calculate delta
      this.textContext.fillText(character, this.m_currentTextWidth, this.m_currentTextHeight);
      if (this.style.stroke) { this.textContext.strokeText(character, this.m_currentTextWidth, this.m_currentTextHeight); }
      const width = this.textContext.measureText(character).width;   // 字号已经*this.resolution，无需再乘

      this.m_currentTextWidth += width + this.style.xInterval * this.resolution;
      if (this.m_currentTextWidth + width >= this.textRectangle[2] * this.resolution) {
        this.m_currentTextWidth = 0;
        this.m_currentTextHeight += this.style.size * this.resolution + this.style.yInterval * this.resolution;
      }
    }

    this.textIndex += count;

    this.updateTexture();

    super.updateTransform();

        // stop condition
    if (this.textIndex >= this.text.length - 1) {
      this.textRendering = false;
      if (this.m_resolve) {
        this.m_resolve();
        this.m_resolve = null;
      }
            // move cursor (if exist)
      if (this.textCursor && this.textCursorFollow) {
        this.textCursor.x = this.m_currentTextWidth;
        this.textCursor.y = this.m_currentTextHeight;
      }
      if (this.textCursor) { this.textCursor.visible = true; } // restore cursor
    }
  }

  updateTexture() {
    const texture = this.textTexture;

    texture.baseTexture.hasLoaded = true;
    texture.baseTexture.resolution = this.resolution;
    texture.baseTexture.width = this.textCanvas.width / this.resolution;
    texture.baseTexture.height = this.textCanvas.height / this.resolution;
    // texture.crop.width = texture._frame.width = this.textCanvas.width / this.resolution;
    // texture.crop.height = texture._frame.height = this.textCanvas.height / this.resolution;
    texture.trim.x = 0;
    texture.trim.y = 0;
    texture.trim.width = texture._frame.width;
    texture.trim.height = texture._frame.height;
    this.textSprite._width = this.textCanvas.width / this.resolution;
    this.textSprite._height = this.textCanvas.height / this.resolution;
    texture.baseTexture.emit('update', texture.baseTexture);
  }

  wait() {
    if (!this.m_promise) {
      this.m_promise = new Promise((resolve, reject) => {
        this.m_resolve = resolve;
      })
      .then(() => this.m_promise = null);
    }

    if (this.visible && this.renderable) {
      return this.m_promise;
    } else {
      return Promise.resolve();
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
      this.addChild(this.textSprite);
      this.addChild(this.textCursor);
    } catch (e) {}
  }

    // addChild(...args) {
    //     super.addChild(...args);
    // }

  destroy() {
    this.background.destroy();
    this.textSprite.destroy();
    this.textCursor.destroy();
    super.destroy();
  }

}

// TransitionPlugin(TextWindow);

function clone(origin) {
  const originProto = Object.getPrototypeOf(origin);

  return Object.assign(Object.create(originProto), origin);
}

// module.exports = TextWindow;
