/**
 * @file        Animation sprite class
 * @author      Icemic Jia <bingfeng.web@gmail.com>
 * @copyright   2015-2017 Icemic Jia
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
import Animation from './animation';

export default class Button extends Animation {
  constructor() {
    super();

    /**
     * false: idle, hover, active
     * true: idle, active
     */
    this.lite = false;

    this.frameBeforeDown = -1;
    this.frameBeforeHover = -1;

    this._onDown = this._onDown.bind(this);
    this._onUp = this._onUp.bind(this);
    this._onHover = this._onHover.bind(this);
    this._onOut = this._onOut.bind(this);

    this.on('pointerdown', this._onDown);
    this.on('pointerup', this._onUp);
    this.on('pointerupoutside', this._onUp);
    this.on('pointerover', this._onHover);
    this.on('pointerout', this._onOut);
  }

  _onDown() {
    if (this.frameBeforeDown < 0) {
      this.frameBeforeDown = this.currentFrame;
    }
    if (this.lite) {
      this.gotoAndStop(1);
    } else {
      this.gotoAndStop(2);
    }
  }
  _onUp() {
    if (this.frameBeforeDown >= 0) {
      this.gotoAndStop(this.frameBeforeDown);
      this.frameBeforeDown = -1;
    }
  }
  _onHover() {
    if (this.frameBeforeHover < 0) {
      this.frameBeforeHover = this.currentFrame;
    }
    if (!this.lite) {
      this.gotoAndStop(1);
    }
  }
  _onOut() {
    if (this.frameBeforeHover >= 0) {
      this.gotoAndStop(this.frameBeforeHover);
      this.frameBeforeHover = -1;
    }
  }

}
