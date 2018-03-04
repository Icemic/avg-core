/**
 * @file        Animation sprite class
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

/* eslint-disable */
import core from 'core/core';
import { TransitionPlugin } from './Transition/TransitionPlugin';
import { TransitionFilter } from './Transition/TransitionFilter';

const PIXI = require('pixi.js');

const logger = core.getLogger('Animation');

@TransitionPlugin
class Animation extends PIXI.Sprite {
  constructor(args) {
    super(args);
    this.type = 'horizontal';
    this.textures = [];
    this.filters = [new TransitionFilter()];

    this.row = 1;
    this.column = 1;
    this.interval = 33;
    this.loopType = 'forward';  // for horizontal & vertical
    this.loop = true; // only for multifiles
    this.delay = 0; // 记录每次的delay值

    this.currentFrame = -1; // 当前帧，为-1是因为后面要++
    this.currentRow = 0;  // 水平精灵图用
    this.currentColumn = 0; // 垂直精灵图用

    this.m_lastTime = 0;
    this.m_delay = 0;   // 用于delay计数
    this.m_delta = 1;   // 用于loopType，bouns时会变成1 -1切换
    this.playing = false;
  }

  // methods

  setType(type) {
    this.type = type;

    return this;
  }
  setFile(file) {
    this.filename = file;

    return this;
  }
  setIndex(index) {
    this.index = index;

    return this;
  }
  setFrame(frame) {
    this.frame = frame;

    return this;
  }
  setRow(row) {
    this.row = row;

    return this;
  }
  setColumn(column) {
    this.column = column;

    return this;
  }
  setInterval(interval) {
    this.interval = interval;

    return this;
  }
  setLoopType(loopType) {
    this.loopType = loopType;
    if (loopType === 'none') { this.loop = false; } else { this.loop = true; }

    return this;
  }
  setLoop(loop) {
    this.loop = loop;

    return this;
  }
  setDelay(delay) {
    this.delay = delay;

    return this;
  }

  exec() {
    if (!this.index || !this.filename) {
      logger.error('Lack of parameters.');

      return;
    }

    switch (this.type) {
      case 'horizontal':
        this.textures = Animation.loadHorizontal(this.filename, this.frame, this.row);
        break;
      case 'vertical':
        this.textures = Animation.loadVertical(this.filename, this.frame, this.column);
        break;
      case 'multifiles':
        this.textures = Animation.loadMultifiles(this.filename);
        this.frame = this.textures.length;
        break;
    }
    this.m_lastTime = Date.now();
    this.playing = true;
  }

  start() {
    this.playing = true;
  }

  cell(frame) {
    this.playing = false;
    this.texture = this.textures[frame];
  }

  stop() {
    this.playing = false;
  }

  updateTransform() {
    if (!this.playing) {
      super.updateTransform();

      return;
    }
    const delta = Date.now() - this.m_lastTime;

    if (delta < this.interval) { return; }
    this.m_lastTime = Date.now();
    if (this.m_delay > 0) {
      this.m_delay -= delta;
      if (this.m_delay <= 0) { this.m_delay = 0; } else { return; }
    }

    this.currentFrame += this.m_delta;

    switch (this.type) {
      case 'horizontal':
        if (this.currentFrame >= this.frame || this.currentFrame < 0) {
          this.currentRow += this.m_delta;
          if ((this.currentRow >= this.row || this.currentRow < 0) && this.loop) {
            if (this.loopType === 'forward') {
              this.currentFrame = 0;
              this.currentRow = 0;
            } else {
              this.m_delta = -this.m_delta;
              this.currentFrame += this.m_delta * 2;
              this.currentRow += this.m_delta;
            }
            if (this.delay) { this.m_delay = this.delay; }
          } else if (this.currentRow >= this.row) { this.playing = false; }
        }
        this.texture = this.textures[this.currentFrame + this.currentRow * this.frame];
        break;
      case 'vertical':
        if (this.currentFrame >= this.frame || this.currentFrame < 0) {
          this.currentColumn += this.m_delta;
          if ((this.currentColumn >= this.column || this.currentColumn < 0) && this.loop) {
            if (this.loopType === 'forward') {
              this.currentFrame = 0;
              this.currentColumn = 0;
            } else {
              this.m_delta = -this.m_delta;
              this.currentFrame += this.m_delta * 2;
              this.currentColumn += this.m_delta;
            }
            if (this.delay) { this.m_delay = this.delay; }
          } else if (this.currentColumn >= this.column) { this.playing = false; } else// if(this.loop)
            { this.texture = this.textures[this.currentFrame]; }
          break;
        }
        this.texture = this.textures[this.currentFrame + this.currentColumn * this.frame];
        break;
      case 'multifiles':
        if ((this.currentFrame >= this.frame || this.currentFrame < 0) && this.loop) {
          if (this.loopType === 'forward') { this.currentFrame = 0; } else {
            this.m_delta = -this.m_delta;
            this.currentFrame += this.m_delta * 2;
          }
          if (this.delay) { this.m_delay = this.delay; }
        } else if (this.currentFrame >= this.frame) {
          this.playing = false;
          break;
        }
        this.texture = this.textures[this.currentFrame];
        break;
    }
    super.updateTransform();
  }

  static loadHorizontal(file, frame, row = 1) {
    const tex = core.getTexture(file);
    const textures = [];

    tex.update();
    const deltaX = tex.width / frame;
    const deltaY = tex.height / row;

    for (let j = 0; j < row; j++) {
      for (let i = 0; i < frame; i++) { textures.push(new PIXI.Texture(tex, new PIXI.Rectangle(deltaX * i, deltaY * j, deltaX, deltaY))); }
    }

    return textures;
  }
  static loadVertical(file, frame, column = 1) {
    const tex = core.getTexture(file);
    const textures = [];
    const deltaX = tex.width / column;
    const deltaY = tex.height / frame;

    for (let i = 0; i < column; i++) { for (let j = 0; j < frame; j++) { textures.push(new PIXI.Texture(tex, new PIXI.Rectangle(deltaX * i, deltaY * j, deltaX, deltaY))); } }

    return textures;
  }
  static loadMultifiles(files) {
    const textures = [];

    for (let i = 0; i < files.length; i++) {
      const tex = core.getTexture(files[i]);

      textures.push(tex);
    }

    return textures;
  }

}

TransitionPlugin(Animation);

module.exports = Animation;
