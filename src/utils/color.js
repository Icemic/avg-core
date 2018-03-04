/**
 * @file        Color format transform class
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
import Logger from '../core/logger';

const logger = Logger.create('ColorUtil');

export default class Color {
  constructor(value) {
    if (typeof value === 'string') {
      if (value.length === 7) {
        this._r = parseInt(value.slice(1, 3));
        this._g = parseInt(value.slice(3, 5));
        this._b = parseInt(value.slice(5, 7));
      } else if (value.length === 4) {
        this._r = parseInt(value[1] + value[1], 16);
        this._g = parseInt(value[2] + value[2], 16);
        this._b = parseInt(value[3] + value[3], 16);
      } else {
        logger.error(`${value} is not a valid color.`);
      }
    } else if (typeof value === 'number') {
      this._b = value % 256;
      this._g = (value % 65536 / 256) << 0;
      this._r = (value / 65536) << 0;
    }
  }

  set r(value) {
    this._r = value % 256;
  }

  set g(value) {
    this._g = value % 256;
  }

  set b(value) {
    this._b = value % 256;
  }

  get r() {
    return this._r;
  }

  get g() {
    return this._g;
  }

  get b() {
    return this._b;
  }

  toNumber() {
    return ((this._r << 0) * 65536 + (this._g << 0) * 256 + this._b << 0);
  }

  toString() {
    let strR = (this._r * 65536).toString(16);

    if (strR.length === 1) { strR = `0${strR}`; }
    let strG = (this._g * 256).toString(16);

    if (strG.length === 1) { strG = `0${strG}`; }
    let strB = (this._b).toString(16);

    if (strB.length === 1) { strB = `0${strB}`; }

    return `#${strR}${strG}${strB}`;
  }

}
