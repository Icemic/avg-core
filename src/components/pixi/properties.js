/**
 * @file        mount props to PIXI.DisplayObject
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

import deepEqual from 'deep-equal';
import core from 'core/core';

const PIXI = require('pixi.js');

const logger = core.getLogger('MountNode');

/**
 * Convert pure array to proper Pixi Object, non-array will be returned as-is.
 *
 * Array[2] --> PIXI.Point
 *
 * Array[4] --> PIXI.Rectangle
 *
 * Array[9] --> PIXI.Matrix
 *
 *
 * @param {any} value
 * @return {any}
 */
function convertToPixiValue(value) {
  if (value instanceof Array) {
    if (value.length === 2) {
      return new PIXI.Point(value[0], value[1]);
    } else if (value.length === 4) {
      return new PIXI.Rectangle(value[0], value[1], value[2], value[3]);
    } else if (value.length === 9) {
      return PIXI.Matrix.fromArray(value);
    }
    logger.warn(`Unrecognized array: ${value}`);

    return value;
  }

  return value;
}

/**
 * Set value for PIXI.DisplayObject
 *
 * 1. value === undefined && defaultValue !== undefined: set node[key] to defaultValue
 * 2. value === undefined && defaultValue === undefined: do nothing
 * 3. value !== undefined: set node[key] to value
 *
 * @this node
 * @param {string} key
 * @param {any} value
 * @param {any} defaultValue
 */
export function setValue(key, value, defaultValue) {
  const node = this;

  if (value === undefined) {
    if (defaultValue === undefined) {
      // do nothing
    } else {
      node[key] = defaultValue;
    }
  } else if (key === 'src') {
    node.src = core.getTexture(value);
  } else if (['position', 'pivot', 'anchor', 'rotation', 'scale', 'skew'].includes(key)) {
    node[key] = convertToPixiValue(value);
  } else {
    node[key] = value;
  }
}

/**
 * update value for PIXI.DisplayObject, if prevValue !== value, update will be executed.
 *
 * @this node
 * @param {string} key
 * @param {any} prevValue
 * @param {any} value
 */
export function updateValue(key, prevValue, value) {
  if (!deepEqual(prevValue, value)) {
    setValue.call(this, key, value);
  }
}

/**
 * Apply props to PIXI.DisplayObject
 *
 * @param {PIXI.DisplayObject} node
 * @param {object} props
 */
export function mountNode(node, props) {
  const setNodeValue = setValue.bind(node);

  setNodeValue('src', props.src);

  setNodeValue('alpha', props.alpha);
  setNodeValue('visible', props.visible);
  setNodeValue('cacheAsBitmap', props.cacheAsBitmap);
  setNodeValue('buttonMode', props.buttonMode);

  setNodeValue('x', props.x);
  setNodeValue('y', props.y);
  setNodeValue('position', props.position);

  setNodeValue('width', props.width);
  setNodeValue('height', props.height);

  setNodeValue('pivot', props.pivot);
  setNodeValue('anchor', props.anchor);

  setNodeValue('rotation', props.rotation);
  setNodeValue('scale', props.scale);
  setNodeValue('skew', props.skew);
  setNodeValue('tint', props.tint);
}

export function updateNode(node, prevProps, props) {
  const updateNodeValue = updateValue.bind(node);

  updateNodeValue('src', prevProps.src, props.src);

  updateNodeValue('alpha', prevProps.alpha, props.alpha);
  updateNodeValue('visible', prevProps.visible, props.visible);
  updateNodeValue('cacheAsBitmap', prevProps.cacheAsBitmap, props.cacheAsBitmap);
  updateNodeValue('buttonMode', prevProps.buttonMode, props.buttonMode);

  updateNodeValue('x', prevProps.x, props.x);
  updateNodeValue('y', prevProps.y, props.y);
  updateNodeValue('position', prevProps.position, props.position);

  updateNodeValue('width', prevProps.width, props.width);
  updateNodeValue('height', prevProps.height, props.height);

  updateNodeValue('pivot', prevProps.pivot, props.pivot);
  updateNodeValue('anchor', prevProps.anchor, props.anchor);

  updateNodeValue('rotation', prevProps.rotation, props.rotation);
  updateNodeValue('scale', prevProps.scale, props.scale);
  updateNodeValue('skew', prevProps.skew, props.skew);
  updateNodeValue('tint', prevProps.tint, props.tint);
}
