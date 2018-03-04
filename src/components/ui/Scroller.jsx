/**
 * @file        Scroller component
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

import React from 'react';
import PropTypes from 'prop-types';
import createComponent from 'components/createComponent';
import ContainerMixin from 'components/ContainerMixin';
import NodeMixin from 'components/NodeMixin';
const PIXI = require('pixi.js');

const RawScroller = createComponent('RawScroller', ContainerMixin, NodeMixin, {

  createNode() {
    // this.node = new PixiLayer();
    this.node = new PIXI.Graphics();
    const button = new PIXI.Graphics();

    this.node.addChild(button);
  },
  mountNode(props) {
    this.setProperties(props);
    const layer = this.node;
    const button = this.node.children[0];

    layer.interactive = true;
    button.interactive = true;
    button.buttonMode = true;
    const buttonMouseDown = e => {
      button.cachedX = button.x;
      button.cachedY = button.y;
      button.clear();
      button.beginFill(button.buttonColor, button.buttonAlpha);

      if (layer.direction === 'vertical') {
        const radius = layer.backgroundWidth / 2;

        button.drawRoundedRect(0, 0, layer.backgroundWidth, button.buttonLength, radius);
        button.x = 0;
      } else {
        const radius = layer.backgroundHeight / 2;

        button.drawRoundedRect(0, 0, button.buttonLength, layer.backgroundHeight, radius);
        button.y = 0;
      }
      button.endFill();

      button.isPressDown = true;
      button.startPointerGlobalX = e.data.global.x;
      button.startPointerGlobalY = e.data.global.y;

      // e.stopPropagation();
    };
    const buttonMouseUp = () => {
      button.clear();
      button.beginFill(button.buttonColor, button.buttonAlpha);

      if (layer.direction === 'vertical') {
        const radius = button.buttonWidth / 2;

        button.drawRoundedRect(0, 0, button.buttonWidth, button.buttonLength, radius);
        button.x = button.cachedX;
      } else {
        const radius = button.buttonWidth / 2;

        button.drawRoundedRect(0, 0, button.buttonLength, button.buttonWidth, radius);
        button.y = button.cachedY;
      }
      button.endFill();

      button.isPressDown = false;

      // e.stopPropagation();
    };

    button.on('mousedown', buttonMouseDown);
    button.on('touchstart', buttonMouseDown);
    button.on('mouseup', buttonMouseUp);
    button.on('touchend', buttonMouseUp);
    button.on('mouseupoutside', buttonMouseUp);
    button.on('touchendoutside', buttonMouseUp);

    /* set event */
    layer._ongoto = props.onGoto;
    button._ondrag = props.onDrag;

    const layerMouseDown = e => {
      if (!button.isPressDown) {
        layer._ongoto && layer._ongoto(e);
      }
      e.stopPropagation();
    };

    layer.on('mousedown', layerMouseDown);

    const buttonMouseMove = e => {
      if (button.isPressDown) {
        button._ondrag && button._ondrag({
          deltaX: (e.data.global.x - button.startPointerGlobalX) / layer.backgroundWidth,
          deltaY: (e.data.global.y - button.startPointerGlobalY) / layer.backgroundHeight,
        });
        button.startPointerGlobalX = e.data.global.x;
        button.startPointerGlobalY = e.data.global.y;
        e.stopPropagation();
      }
    };

    button.on('mousemove', buttonMouseMove);
    button.on('touchmove', buttonMouseMove);

    return layer;
  },
  updateNode(prevProps, props) {
    this.setProperties(props);
    const layer = this.node;
    const button = this.node.children[0];

    layer._ongoto = props.onGoto;
    button._ondrag = props.onDrag;
  },
  setProperties(props) {
    const p = {
      backgroundWidth: props.backgroundWidth || 10,
      backgroundHeight: props.backgroundHeight || 10,
      direction: props.direction || 'vertical',
      backgroundColor: (typeof props.backgroundColor === 'number') ? props.backgroundColor : 0xffffff,
      backgroundAlpha: (typeof props.backgroundAlpha === 'number') ? props.backgroundAlpha : 1,
      x: props.x || 0,
      y: props.y || 0,
      visible: (typeof props.visible === 'boolean') ? props.visible : true,

      buttonWidth: props.buttonWidth || 10,
      buttonColor: (typeof props.buttonColor === 'number') ? props.buttonColor : 0xffffff,
      buttonAlpha: (typeof props.buttonAlpha === 'number') ? props.buttonAlpha : 1,
      buttonLength: props.buttonLength || 10,
      buttonPosition: props.buttonPosition || 0,
    };
    const layer = this.node;

    layer.clear();
    layer.beginFill(p.backgroundColor, p.backgroundAlpha);
    layer.drawRect(0, 0, p.backgroundWidth, p.backgroundHeight);
    layer.endFill();
    layer.x = p.x;
    layer.y = p.y;
    layer.visible = p.visible;

    const button = this.node.children[0];

    // 若为按下状态，说明当前滚动条正在被拖动，不进行样式重绘，也没必要重绘
    button.clear();
    button.beginFill(p.buttonColor, p.buttonAlpha);

    if (p.direction === 'vertical') {
      const radius = (button.isPressDown ? p.backgroundWidth : p.buttonWidth) / 2;

      button.drawRoundedRect(0, 0, (button.isPressDown ? p.backgroundWidth : p.buttonWidth), p.buttonLength, radius);
    } else {
      const radius = (button.isPressDown ? p.backgroundHeight : p.buttonWidth) / 2;

      button.drawRoundedRect(0, 0, p.buttonLength, (button.isPressDown ? p.backgroundHeight : p.buttonWidth), radius);
    }
    button.endFill();

    if (p.direction === 'vertical') {
      !button.isPressDown && (button.x = (p.backgroundWidth - p.buttonWidth) / 2);
      button.y = (p.backgroundHeight - p.buttonLength) * p.buttonPosition;
    } else {
      !button.isPressDown && (button.y = (p.backgroundHeight - p.buttonWidth) / 2);
      button.x = (p.backgroundWidth - p.buttonLength) * p.buttonPosition;
    }

    /* store size info for event */
    layer.backgroundColor = p.backgroundColor;
    layer.backgroundAlpha = p.backgroundAlpha;
    layer.backgroundWidth = p.backgroundWidth;
    layer.backgroundHeight = p.backgroundHeight;
    button.buttonColor = p.buttonColor;
    button.buttonAlpha = p.buttonAlpha;
    button.buttonWidth = p.buttonWidth;
    button.buttonLength = p.buttonLength;
    layer.direction = p.direction;

  }
});

export default class Scroller extends React.PureComponent {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    visible: PropTypes.bool,
    children: PropTypes.any,
  };
  render() {
    return React.createElement(RawScroller, this.props, this.props.children);
  }
}
