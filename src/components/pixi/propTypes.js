/**
 * @file        PropTypes defination of PIXI.DisplayObject
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

import PropTypes from 'prop-types';

export default {
  alpha: PropTypes.number,
  visible: PropTypes.bool,
  cacheAsBitmap: PropTypes.bool,
  buttonMode: PropTypes.bool,
  x: PropTypes.number,
  y: PropTypes.number,
  position: PropTypes.arrayOf(PropTypes.number),
  width: PropTypes.number,
  height: PropTypes.number,
  pivot: PropTypes.arrayOf(PropTypes.number),
  anchor: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.number,
  scale: PropTypes.arrayOf(PropTypes.number),
  skew: PropTypes.arrayOf(PropTypes.number),
  tint: PropTypes.oneOf([PropTypes.number, PropTypes.string]),
  children: PropTypes.any,
};
