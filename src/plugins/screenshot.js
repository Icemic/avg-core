/**
 * @file        Screen shot signals
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

function resizeImage(dataurl, width, height) {
  const sourceImage = new Image();

  return new Promise(resolve => {
    sourceImage.onload = function () {
      // Create a canvas with the desired dimensions
      const canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      // Scale and draw the source image to the canvas
      canvas.getContext('2d').drawImage(sourceImage, 0, 0, width, height);

      // Convert the canvas to a data URL in PNG format
      resolve(canvas.toDataURL());
    };
    sourceImage.src = dataurl;
  });
}

/**
 * Screen shot plugin
 *
 * You can visit it via `core.plugins.shot`
 *
 * @export
 * @class Screenshot
 */
export default class Screenshot {
  constructor(core) {
    this.core = core;
    this.store = {};

    core.plugins.shot = this;
  }

  /**
  * Supply screenshot signals
  * Shot current screen to a texture and pass it through `ctx`.
  *
  * @event shot
  * @async
  * @param  {number}   [width]  width of screen shot, default to 0, current screen width
  * @param  {number}   [height]  height of screen shot, default to 0, current screen height
  * @param  {string}   [name='default]  name of the shot
  * @param  {string}   [type='base64']  type of returned data, 'base64', 'canvas', 'image', 'pixels'
  * @returns {string|HTMLCanvasElement|HTMLImageElement|ArrayBuffer} shot data
  *
  * @memberOf Screenshot
  */
  async shot(width, height, name = 'default', type = 'base64') {
    const renderer = this.core.getRenderer();
    const stage = this.core.getStage();

    const _width = width || renderer.width;
    const _height = height || renderer.height;

    // TODO: renderer.extract seems to have bugs, now using a custom implementation;
    let base64;

    if (type === 'canvas') {
      base64 = renderer.extract.canvas(stage);
    } else if (type === 'image') {
      base64 = renderer.extract.image(stage);
    } else if (type === 'pixels') {
      base64 = renderer.extract.pixels(stage);
    } else {
      base64 = renderer.extract.base64(stage);
    }

    const data = await resizeImage(base64, _width, _height);

    const _name = name || 'default';

    this.store[_name] = data;

    return data;
  }

  /**
   * Get a previous shot by its name
   *
   * @param {string} [name='default'] name of the shot
   * @returns {string|HTMLCanvasElement|HTMLImageElement|ArrayBuffer}
   *
   * @memberOf Screenshot
   */
  get(name = 'default') {
    const _name = name || 'default';

    return this.store[_name];
  }
}
