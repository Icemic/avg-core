/**
 * @file        Text sprite class
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

/**
 * Class representing a TextSprite. <br>
 * default font style is `normal 24px sans-serif`
 * @extends PIXI.Text
 * @param {string} text The string that you would like the text to display
 * @param {object} style The style parameters, see http://pixijs.download/v4.2.3/docs/PIXI.TextStyle.html
 */
class TextSprite extends PIXI.Text {
  constructor(text = '', style = {}) {
    super(text, {
      fontFamily: 'sans-serif',
      fontSize: 24,
      fill: 0xffffff,
      ...style,
    });

    this.zorder = 0;
  }
}

module.exports = TextSprite;
