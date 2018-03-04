/**
 * @file        util for scaling canvas
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

/**
 * @method scale
 *
 * @param {PIXI.WebGLRenderer} renderer
 * @param {number} width width to fit
 * @param {number} height height to fit
 */
export default function fitWindow(renderer, width, height) {
  const ratio = renderer.width / renderer.height;
  const resolution = renderer.resolution;

  let offsetW,
      offsetH,
      contentW,
      contentH;

  if (ratio > width / height) {
    contentW = width;
    contentH = width / ratio;
    offsetW = 0;
    offsetH = (height - (width / ratio)) / 2;
  } else {
    contentW = height * ratio;
    contentH = height;
    offsetW = (width - (height * ratio)) / 2;
    offsetH = 0;
  }

  const view = renderer.view;

  view.style.position = 'absolute';
  // renderer.view.style.width = contentW + "px";
  // renderer.view.style.height = contentH + "px";
  view.style.backfaceVisibility = 'hidden';
  view.style.transformOrigin = 'left top';
  view.style.webkitTransformOrigin = 'left top';
  view.style.transform = `scale(${contentW / renderer.width * resolution}, ${contentH / renderer.height * resolution}) translateZ(0)`;
  view.style.webkitTransform = `scale(${contentW / renderer.width * resolution}, ${contentH / renderer.height * resolution}) translateZ(0)`;

  view.style.left = `${offsetW}px`;
  view.style.top = `${offsetH}px`;
}
