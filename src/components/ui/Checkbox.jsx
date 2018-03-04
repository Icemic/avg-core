/**
 * @file        Checkbox component
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

import React from 'react';
import createComponent from 'components/createComponent';
import ContainerMixin from 'components/ContainerMixin';
import NodeMixin from 'components/NodeMixin';
import Sprite from 'classes/Sprite';
import core from 'core/core';
import pixiPropTypes from '../pixi/propTypes';
import { mountNode, updateNode, setValue, updateValue } from '../pixi/properties';

const PIXI = require('pixi.js');

const Groups = {};

function addToGroup(name, node) {
  let groupList = Groups[name];

  if (!groupList) {
    groupList = Groups[name] = [];
  }

  groupList.push(node);
}

function removeFromGroup(name, node) {
  const groupList = Groups[name];

  if (!groupList) {
    return;
  }

  Groups[name] = groupList.filter(item => item === node);
}

function includesInGroup(name, node) {
  const groupList = Groups[name];

  if (!groupList) {
    return false;
  }

  for (const item of groupList) {
    if (item === node) {
      return true;
    }
  }

  return false;
}

function getAllFromGroupByName(name) {
  return Groups[name] || [];
}

const RawCheckbox = createComponent('RawCheckbox', ContainerMixin, NodeMixin, {

  createNode() {
    this.node = new Sprite();
  },
  mountNode(props) {
    // this.setProperties(props);
    const node = this.node;

    node.buttonMode = true;
    // node.on('mouseover', () => this.check(true));
    // node.on('mouseout', () => this.check(0));
    // node.on('mousedown', () => this.setFrame(node.lite ? 1 : 2));
    node.on('mouseup', () => this.switch());
    node.on('touchend', () => this.switch());
    // node.on('mouseupoutside', () => this.check(0));

    mountNode(node, props);
    // setValue.call(node, 'lite', props.lite, true);
    setValue.call(node, 'defaultChecked', props.defaultChecked, false);
    setValue.call(node, 'value', props.value, null);
    setValue.call(node, 'onchange', props.onChange, null);
    setValue.call(node, 'name', props.name, null);

    if (props.checked != null) {
      node.controlled = true;
      setValue.call(node, 'checked', props.checked, null);
    } else {
      node.controlled = false;
    }

    node.texture.baseTexture.on('loaded', () => {
      this.setFrame(0);
      this.setChecked(props.checked || node.defaultChecked, false)
    });
    this.setFrame(0);
    this.setChecked(props.checked || node.defaultChecked, false);

    return node;
  },
  updateNode(prevProps, props) {
    // this.setProperties(props);
    const node = this.node;

    updateNode(node, prevProps, props);
    // updateValue.call(node, 'lite', prevProps.lite, props.lite);
    updateValue.call(node, 'defaultChecked', prevProps.defaultChecked, props.defaultChecked);
    updateValue.call(node, 'value', prevProps.value, props.value);
    updateValue.call(node, 'onchange', prevProps.onChange, props.onChange);
    updateValue.call(node, 'name', prevProps.name, props.name);

    if (props.checked != null) {
      node.controlled = true;
      updateValue.call(node, 'checked', prevProps.checked, props.checked);
    } else {
      node.controlled = false;
    }

    node.texture.baseTexture.on('loaded', () => this.setChecked(node.checked || node.defaultChecked, false));
    this.setChecked(node.checked || node.defaultChecked, false);
  },
  unmountNode() {
    removeFromGroup(this.node.name, this);
  },
  setChecked(value, triggerEvent = true) {
    const checked = !!value;
    const name = this.node.name;

    if (name) {

      if (!includesInGroup(name, this)) {
        addToGroup(name, this);
      }

      // 互斥模式下不能取消选择（like radio in html）
      if (!checked) {
        return;
      }

      const elements = getAllFromGroupByName(name);

      for (const element of elements) {
        if (element.node === this.node) {
          this.node.checked = true;
          this.setFrame(1);
        } else {
          element.node.checked = false;
          element.setFrame(0);
        }

        /**
         * 当指定了 name 时，多个互斥的 Checkbox 只需有一个设置 onChange 即可，
         * 除非你确实需要当状态变化时，每个都触发一次完全相同的事件。
         */
        triggerEvent && element.node.onchange && element.node.onchange(this.node.value);
      }

    } else {
      this.node.checked = checked;

      if (checked) {
        this.setFrame(1);
      } else {
        this.setFrame(0);
      }

      triggerEvent && this.node.onchange && this.node.onchange(this.node.value);
    }

  },
  switch() {
    if (!this.node.controlled) {
      this.setChecked(!this.node.checked);
    }
  },
  setFrame(num) {
    const layer = this.node;
    const frameCount = 2;

    if (!layer.texture || !layer.texture.baseTexture.hasLoaded) {
      return false;
    }

    const width = layer.texture.baseTexture.width;
    const height = layer.texture.baseTexture.height;

    const frame = new PIXI.Rectangle();

    frame.x = width * num / frameCount;
    frame.y = 0;
    frame.width = width / frameCount;
    frame.height = height;
    layer.texture.frame = frame;

    // layer.texture.emit('update');

    // e.stopped = true;
    return false;
  }
});

export default class Checkbox extends React.PureComponent {
  static propTypes = pixiPropTypes;
  render() {
    return React.createElement(RawCheckbox, this.props, this.props.children);
  }
}
