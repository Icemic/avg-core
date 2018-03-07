/**
 * @file        Layout component
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
import Scroller from './Scroller';
import combineProps from 'utils/combineProps';
import findPixiNode from '../findPixiNode';
import deepEqual from 'deep-equal';

const PIXI = require('pixi.js');

function getValidValueInRange(min, max, value) {
  return Math.min(Math.max(min, value), max);
}

export default class Layout extends React.Component {
  static propTypes = {
    ...Layer.propTypes,
    padding: PropTypes.arrayOf(PropTypes.number),
    direction: PropTypes.string,
    baseline: PropTypes.number,
    interval: PropTypes.number,
    maxWidth: PropTypes.number,
    maxHeight: PropTypes.number,
    overflowX: PropTypes.string,
    overflowY: PropTypes.string,
    scrollerOffsetX: PropTypes.number,
    scrollerOffsetY: PropTypes.number,
    onScroll: PropTypes.func,
    vertical: PropTypes.number,
    horizental: PropTypes.number,
    children: PropTypes.any,
  }
  static defaultProps = {
    x: 0,
    y: 0,
    padding: [0, 0, 0, 0],
    interval: 10,
    direction: 'vertical',
    overflowX: 'scroll',
    overflowY: 'scroll',
    scrollStyle: {},
    scrollerOffsetX: 10,
    scrollerOffsetY: 10,
    onScroll: null
  }
  constructor(props) {
    super(props);

    this.handleWheel = this.handleWheel.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.scrollDragV = this.scrollDragV.bind(this);
    this.scrollDragH = this.scrollDragH.bind(this);

    this.state = {
      width: null,
      height: null,
      innerX: 0,
      innerY: 0,
      childPositions: [],
    };
  }
  componentDidMount() {
    this.calcPosition();
  }
  componentDidUpdate(prevProps) {
    if (this.checkChildrenChanged(prevProps, this.props)) {
      this.calcPosition();
    }
  }
  checkChildrenChanged(prevProps, props) {
    if (prevProps.children && props.children && prevProps.children.length === props.children.length) {
      const prevChildren = prevProps.children;
      const children = props.children;

      for (let i = 0; i < props.children.length; i++) {
        const prevChild = prevChildren[i];
        const child = children[i];

        if (child.displayName === prevChild.displayName && deepEqual({...child.props, children: null}, {...prevChild.props, children: null})) {
          continue;
        } else {
          return true;
        }
      }

      return false;
    }

    return true;
  }
  calcPosition() {
    let maxWidth = 0;
    let maxHeight = 0;
    const refKeys = Object.keys(this.children);
    let count = refKeys.length;

    for (const refKey of refKeys) {
      const ref = this.children[refKey];
      const node = findPixiNode(ref);

      if (!node.texture || node.texture === PIXI.Texture.EMPTY || node.texture.valid) {
        const bound = node.getBounds();

        maxWidth = Math.max(maxWidth, bound.width);
        maxHeight = Math.max(maxHeight, bound.height);
        count--;
        if (count <= 0) {
          this.applyLayout(this.props.maxWidth || maxWidth, this.props.maxHeight || maxHeight);
        }
      } else {

        // FIXME: force disable eslint now, need refactoring to avoid eslint error.
        /* eslint-disable */
        node.texture.on('update', () => {
          const bound = node.getBounds();

          maxWidth = Math.max(maxWidth, bound.width);
          maxHeight = Math.max(maxHeight, bound.height);
          count--;
          if (count <= 0) {
            this.applyLayout(this.props.maxWidth || maxWidth, this.props.maxHeight || maxHeight);
          }
        });
        /* eslint-enable */
      }
    }
  }
  componentWillUnmount() {
    core.getRenderer().view.removeEventListener('wheel', this.handleWheel, true);
  }
  applyLayout(maxWidth, maxHeight) {
    const paddingLeft   = this.props.padding[0];
    const paddingTop    = this.props.padding[1];
    const paddingRight  = this.props.padding[2];
    const paddingBottom = this.props.padding[3];
    const interval = this.props.interval;
    const direction = this.props.direction;
    const baseline = this.props.baseline;

    let lastBottom = paddingTop;
    let lastRight  = paddingLeft;

    const refKeys = Object.keys(this.children);
    const childPositions = [];

    for (const refKey of refKeys) {
      const ref = this.children[refKey];
      const node = findPixiNode(ref);
      const bound = node.getBounds();
      const anchorX = node.anchor ? node.anchor.x : 0;
      const anchorY = node.anchor ? node.anchor.y : 0;

      if (direction === 'vertical') {
        childPositions.push(lastRight + ((maxWidth - bound.width) * baseline) + (bound.width * (anchorX)));
        childPositions.push(lastBottom + (bound.height * anchorY));
        // node.x = lastRight + (maxWidth - node.width) * baseline;
        // node.y = lastBottom;
        lastBottom += interval + bound.height;
      } else {
        childPositions.push(lastRight + (bound.width * anchorX));
        childPositions.push(lastBottom + ((maxHeight - bound.height) * baseline) + (bound.height * anchorY));
        // node.x = lastRight;
        // node.y = lastBottom + (maxHeight - node.height) * baseline;
        lastRight += interval + bound.width;
      }
    }

    if (direction === 'vertical') {
      this.setState({
        width: paddingLeft + maxWidth + paddingRight,
        height: lastBottom - interval + paddingBottom,
        childPositions,
      }, () => this.drawScrollBar());

    } else {
      this.setState({
        width: lastRight - interval + paddingRight,
        height: paddingTop + maxHeight + paddingBottom,
        childPositions,
      }, () => this.drawScrollBar());
    }

    core.getRenderer().view.addEventListener('wheel', this.handleWheel, true);
  }
  handleWheel(evt) {
    const point = new PIXI.Point(evt.offsetX, evt.offsetY);

    if (this._reactInternalInstance._mountImage.containsPoint(point)) {
      this.tempScrollHandler({
        deltaX: evt.deltaX,
        deltaY: evt.deltaY,
        deltaZ: evt.deltaZ,
      });
      evt.preventDefault();
      evt.stopPropagation();
    }
  }
  tempScrollHandler(e) {
    // const deltaX = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
    // const deltaY = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? 0 : e.deltaY;
    let deltaX,
        deltaY,
        x,
        y;

    if (e.deltaX != null) {
      deltaX = e.deltaX;
      x = this.state.innerX - deltaX;
    } else {
      x = e.x;
    }
    if (e.deltaY != null) {
      deltaY = e.deltaY;
      y = this.state.innerY - deltaY;
    } else {
      y = e.y;
    }

    const maxWidth = this.props.maxWidth || this.state.width;
    const maxHeight = this.props.maxHeight || this.state.height;

    let innerX = getValidValueInRange(maxWidth - this.state.width, 0, x);
    let innerY = getValidValueInRange(maxHeight - this.state.height, 0, y);

    const posV = Math.min(1, Math.abs(innerY) / (this.state.height - this.props.maxHeight));
    const posH = Math.min(1, Math.abs(innerX) / (this.state.width - this.props.maxWidth));

    this.props.onScroll && this.props.onScroll({
      vertical: posV,
      horizental: posH
    });

    if (this.props.vertical) {
      innerY = -(this.state.height - this.props.maxHeight) * this.props.vertical;
    }
    if (this.props.horizental) {
      innerX = -(this.state.width - this.props.maxWidth) * this.props.horizental;
    }

    this.setState({
      innerX: this.props.overflowX === 'scroll' ? innerX : 0,
      innerY: this.props.overflowY === 'scroll' ? innerY : 0,
      scrollButtonPosV: this.props.vertical || posV,
      scrollButtonPosH: this.props.horizental || posH,
    });
  }
  drawScrollBar() {
    let backHeightV,
        xV,
        yV,
        lengthV,
        backWidthH,
        xH,
        yH,
        lengthH;
    const visibleV = (this.props.maxHeight < this.state.height) && this.props.overflowY === 'scroll';
    const visibleH = (this.props.maxWidth < this.state.width) && this.props.overflowX === 'scroll';

    const backWidthV = this.props.scrollStyle.backgroundWidth || 10;
    const backHeightH = this.props.scrollStyle.backgroundWidth || 10;

    if (visibleV) {
      backHeightV = this.props.maxHeight - (visibleH ? backHeightH : 0);
      xV = this.props.maxWidth - backWidthV;
      yV = 0;
      lengthV = this.props.maxHeight / this.state.height * this.props.maxHeight;
    }
    if (visibleH) {
      backWidthH = this.props.maxWidth - (visibleV ? backWidthV : 0);
      xH = 0;
      yH = this.props.maxHeight - backHeightH;
      lengthH = this.props.maxWidth / this.state.width * this.props.maxWidth;
    }
    this.setState({
      scrollBackColorV: this.state.scrollBackColorV,
      scrollBackAlphaV: this.state.scrollBackAlphaV,
      scrollBackHeightV: backHeightV,
      scrollXV: xV,
      scrollYV: yV,
      scrollVisibleV: visibleV,
      scrollButtonLengthV: lengthV,
      scrollBackColorH: this.state.scrollBackColorH,
      scrollBackAlphaH: this.state.scrollBackAlphaH,
      scrollBackWidthH: backWidthH,
      scrollXH: xH,
      scrollYH: yH,
      scrollVisibleH: visibleH,
      scrollButtonLengthH: lengthH,
    });

    this.tempScrollHandler({ deltaX: 0, deltaY: 0 });
  }
  scrollDragV(e) {
    this.tempScrollHandler({ deltaX: 0, deltaY: e.deltaY * this.state.height });
  }
  scrollDragH(e) {
    this.tempScrollHandler({ deltaX: e.deltaX * this.state.width, deltaY: 0 });
  }
  handleTouchStart(e) {
    if (this.state.scrolling) {
      clearInterval(this.state.scrollId);
    }
    this.setState({
      touching: true,
      scrolling: false,
      touchStartTime: Date.now(),
      touchX: e.local.x,
      touchY: e.local.y,
      originX: this.state.innerX,
      originY: this.state.innerY,
    });
  }
  handleTouchMove(e) {
    const point = e.global;

    if (this._reactInternalInstance._mountImage.containsPoint(point)) {
      const x = this.state.originX - this.state.touchX + e.local.x;
      const y = this.state.originY - this.state.touchY + e.local.y;

      this.tempScrollHandler({ x, y });
      e.stopPropagation();
    }
  }
  handleTouchEnd() {
    // calculate speed, acceleration
    const time = Date.now() - this.state.touchStartTime;
    const speedX = (this.state.innerX - this.state.originX) / time;
    let speedY = (this.state.innerY - this.state.originY) / time;

    if (Math.abs(speedY) > 0.2) {
      const id = setInterval(() => {
        this.tempScrollHandler({ y: this.state.innerY + (speedY * 33) });
        const speedY2 = speedY - ((0.0013 * 33) * Math.sign(speedY));

        if (Math.sign(speedY) !== Math.sign(speedY2) || (Math.sign(speedY2) === 0)) {
          clearInterval(id);
        } else {
          speedY = speedY2;
        }
      }, 33);

      this.setState({
        touching: false,
        scrolling: true,
        scrollId: id,
      });
    } else {
      this.setState({
        touching: false,
      });
    }
  }
  children = [];
  render() {
    const {
      backgroundColor,
      backgroundAlpha,
      backgroundWidth,
      buttonColor,
      buttonAlpha,
      buttonWidth,
    } = {
      backgroundColor: 0xffffff,
      backgroundAlpha: 0.6,
      backgroundWidth: 10,
      buttonColor: 0xffffff,
      buttonAlpha: 1,
      buttonWidth: 6,
      ...this.props.scrollStyle,
    };

    this.children = [];

    return (
      <Layer {...combineProps(this.props, Layer.propTypes)}
        width={this.props.maxWidth || this.state.width}
        height={this.props.maxHeight || this.state.height}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
      >
        <Layer
          x={this.state.innerX} y={this.state.innerY}
          width={this.state.width} height={this.state.height}
        >
          {React.Children.map(this.props.children, (element, index) => React.cloneElement(element, {
            ref: arg => { element.ref && element.ref(arg); arg && (this.children[index] = arg); },
            key: index,
            x: this.state.childPositions[index * 2],
            y: this.state.childPositions[(index * 2) + 1],
          }))}
        </Layer>
        <Scroller backgroundColor={backgroundColor}
                  backgroundAlpha={backgroundAlpha}
                  backgroundWidth={backgroundWidth}
                  backgroundHeight={this.state.scrollBackHeightV - this.props.scrollerOffsetY}
                  x={this.state.scrollXV - this.props.scrollerOffsetX} y={this.state.scrollYV}
                  visible={this.state.scrollVisibleV}
                  direction='vertical'
                  buttonWidth={buttonWidth}
                  buttonColor={buttonColor}
                  buttonAlpha={this.state.scrollButtonAlphaV || buttonAlpha}
                  buttonLength={this.state.scrollButtonLengthV}
                  buttonPosition={this.state.scrollButtonPosV} key='scrollV'
                  onDrag={this.scrollDragV}
                  onMouseover={() => this.setState({ scrollButtonAlphaV: 1 })}
                  onMouseout={() => this.setState({ scrollButtonAlphaV: buttonAlpha })}
                  onTouchStart={() => this.setState({ scrollButtonAlphaV: 1 })}
                  onTouchEnd={() => this.setState({ scrollButtonAlphaV: buttonAlpha })}
                  onTouchEndOutside={() => this.setState({ scrollButtonAlphaV: buttonAlpha })} />
        <Scroller backgroundColor={backgroundColor}
                  backgroundAlpha={backgroundAlpha}
                  backgroundWidth={this.state.scrollBackWidthH - this.props.scrollerOffsetX}
                  backgroundHeight={backgroundWidth}
                  x={this.state.scrollXH} y={this.state.scrollYH - this.props.scrollerOffsetY}
                  visible={this.state.scrollVisibleH}
                  direction='horizental'
                  buttonWidth={buttonWidth}
                  buttonColor={buttonColor}
                  buttonAlpha={this.state.scrollButtonAlphaH || buttonAlpha}
                  buttonLength={this.state.scrollButtonLengthH}
                  buttonPosition={this.state.scrollButtonPosH} key='scrollH'
                  onDrag={this.scrollDragH}
                  onMouseover={() => this.setState({ scrollButtonAlphaH: 1 })}
                  onMouseout={() => this.setState({ scrollButtonAlphaH: buttonAlpha })}
                  onTouchStart={() => this.setState({ scrollButtonAlphaH: 1 })}
                  onTouchEnd={() => this.setState({ scrollButtonAlphaH: buttonAlpha })}
                  onTouchEndOutside={() => this.setState({ scrollButtonAlphaH: buttonAlpha })} />
        <Layer visible={this.state.scrollVisibleV && this.state.scrollVisibleH}
               width={backgroundWidth}
               height={backgroundWidth}
               x={this.state.scrollXV - this.props.scrollerOffsetX} y={this.state.scrollYH - this.props.scrollerOffsetY}
               fillColor={backgroundColor} fillAlpha={backgroundAlpha} />
      </Layer>
    );
  }
}
