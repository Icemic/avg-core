/**
 * @file        Container sprite class
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
// import { TransitionPlugin } from './Transition/TransitionPlugin';
// import { TransitionFilter } from './Transition/TransitionFilter';

/**
 * Class representing a Container.
 * @extends PIXI.Graphics
 */
class Container extends PIXI.Container {

  /**
   * Create a sprite.
   *
   * It is a empty sprite, you should specify its content (use {@link Sprite#setFile}, for example)
   * and call {@link Sprite#execSync}.
   */
  constructor() {
    super();
    this.zorder = 0;

    // this.filters = [new TransitionFilter()];
  }

  /**
   * Specify sprite index.
   * This method do not take effect until {@link Sprite#execSync} is called.
   * @param {number} index - the id of sprite
   * @returns {Sprite} - this
   */
  setIndex(index) {
    this.index = index;

    return this;
  }

}

// TransitionPlugin(Container);

export default Container;
