/**
 * @file        Sprite class
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

import * as PIXI from 'pixi.js';

class Sprite extends PIXI.Sprite {
  private _rectangle?: PIXI.Rectangle
  constructor() {
    super();

    this._rectangle = undefined;
  }

  set rectangle(value: PIXI.Rectangle | undefined) {
    this._rectangle = value;
    if (this.texture) {
      const baseTexture = this.texture.baseTexture;

      this.texture.destroy();
      this.texture = new PIXI.Texture(baseTexture, this._rectangle);
    }
  }
  get rectangle() {
    return this._rectangle;
  }

  set src(value: PIXI.BaseTexture) {
    if (this.texture) {
      this.texture.destroy();
      this.texture = new PIXI.Texture(value, this._rectangle);
    } else {
      this.texture = new PIXI.Texture(value, this._rectangle);
      this.destroy();
    }
  }
}

export default Sprite;
