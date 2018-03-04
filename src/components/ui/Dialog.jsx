/**
 * @file        Dialog component
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
import core from 'core/core';
import { Layer } from '../base/Layer';
import combineProps from 'utils/combineProps';

function getValidValueInRange(min, max, value) {
  return Math.min(Math.max(min, value), max);
}

export default class Dialog extends React.Component {
  static propTypes = {
    ...Layer.propTypes,
    modal: PropTypes.bool,
    dragable: PropTypes.bool,
    dragArea: PropTypes.arrayOf(PropTypes.number),
    children: PropTypes.any,
  }
  static defaultProps = {
    x: 0,
    y: 0,
    dragable: false,
    dragArea: [0, 0, Infinity, Infinity],
  }
  constructor(props) {
    super(props);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

    this.state = {
      clicked: false,
      x: this.props.x || 0,
      y: this.props.y || 0,
    };
  }
  handleMouseDown(e) {
    const [left, top, right, bottom] = this.props.dragArea;
    const { x, y } = e.local;

    if (this.props.dragable && x > left && x < right && y > top && y < bottom) {
      this.setState({
        clicked: true,
        startX: this.state.x,
        startY: this.state.y,
        startGlobalX: e.global.x,
        startGlobalY: e.global.y,
      });
      e.stopPropagation();
    }
  }
  handleMouseUp(e) {
    if (this.state.clicked) {
      this.setState({
        clicked: false,
      });
      e.stopPropagation();
    }
  }
  handleMouseMove(e) {
    if (this.state.clicked) {
      const renderer = core.getRenderer();
      const state = this.state;
      const xMin = this.props.width * (0 + this.props.anchor[0] || 0);
      const xMax = renderer.width - (this.props.width * (1 - this.props.anchor[0] || 0));
      const x = state.startX + (e.global.x - state.startGlobalX);
      const yMin = this.props.height * (0 + this.props.anchor[1] || 0);
      const yMax = renderer.height - (this.props.height * (1 - this.props.anchor[1] || 0));
      const y = state.startY + (e.global.y - state.startGlobalY);

      this.setState({
        x: getValidValueInRange(xMin, xMax, x),
        y: getValidValueInRange(yMin, yMax, y),
      });
    }
    // e.stopPropagation();
  }
  render() {
    const core =  (
      <Layer buttonMode={false} {...combineProps(this.props, Layer.propTypes)}
        x={this.state.x} y={this.state.y}
        onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp} onMouseUpOutside={this.handleMouseUp}
        onMouseMove={this.handleMouseMove} onClick={e => e.stopPropagation()}
        onTouchStart={this.handleMouseDown} onTouchEnd={this.handleMouseUp} onTouchEndOutside={this.handleMouseUp}
        onTouchMove={this.handleMouseMove} onTap={e => e.stopPropagation()}
      >
        {this.props.children}
      </Layer>
    );

    return this.props.modal ? (<Layer visible={this.props.visible}>{core}</Layer>) : core;
  }
}
