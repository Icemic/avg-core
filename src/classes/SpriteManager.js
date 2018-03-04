/**
 * @file        Sprite manager
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
const PIXI = require('pixi.js');

import Sprite from './Sprite';
import Animation from './Animation';
import TextSprite from './TextSprite';
import TextWindow from './TextWindow';
import { attachToSprite } from './EventManager';
import { TransitionPlugin } from './Transition/TransitionPlugin';
import { TransitionFilter } from './Transition/TransitionFilter';
import core from 'core/core';

const logger = core.getLogger('SpriteManager');

const Sprites = new Map();
let Renderer = null;
let Stage = null;
const textWindowOptions = {
  currentIndex: -2
};

export function init() {
  Renderer = new PIXI.WebGLRenderer(1280, 720);
  Stage = new PIXI.Container();
  attachToSprite(Stage);
    // Stage.buttonMode = true;

  insert(-1, Stage);

    // Transition Support
  Stage.filters = [new TransitionFilter()];
  TransitionPlugin(Stage);

  return Renderer.view;
}

export function getStage() {
  return Stage;
}
export function getRenderer() {
  return Renderer;
}

/**
 * create a normal sprite
 * argument `rect` there is different from this in BKEngine,
 *     for it default to `null`, instead of [0,0,0,0] in BKEngine.
 * @method create
 * @param  {Number} index [description]
 * @param  {String} file  [description]
 * @param  {Rectangle} rect  [description]
 */
export function create(index, file, rect) {
    // 判断index是否已存在
  const sp = new Sprite();

  sp.setFile(file).setIndex(index).setRect(rect).execSync();
  attachToSprite(sp);
  insert(index, sp);
}

export function createText(index, text, options) {
  options = {
    color: 0xffffff,
    size: 24,
    font: 'sans-serif',
    width: -1,
    height: -1,
    xinterval: 0,
    yinterval: 3,
    extrachar: '...',
    bold: false,
    italic: false,
    strike: false,
    under: false,
    shadow: false,
    shadowcolor: 0x0,
    stroke: false,
    strokecolor: 0x0,
    ...options
  };
  const textsprite = new TextSprite();

  textsprite.setIndex(index).setText(text).setColor(options.color).setSize(options.size).setFont(options.font)
       .setTextWidth(options.width).setTextHeight(options.height).setXInterval(options.xinterval).setYInterval(options.yinterval)
       .setExtraChar(options.extrachar).setBold(options.bold).setItalic(options.italic)/* .setStrike(strike).setUnder(under)*/
       .setShadow(options.shadow).setShadowColor(options.shadowcolor).setStroke(options.stroke).setStrokeColor(options.strokecolor)
       .exec();
  attachToSprite(textsprite);
  insert(index, textsprite);
}

/**
 * create a frame animation.
 * @method createAnimation
 * @param  {String}        direction          horizontal or vertical, leave it null if using multifiles.
 * @param  {Number}        index              [description]
 * @param  {String}        file               file for horizontal or vertical mode
 * @param  {Array}         files              files for multifiles mode
 * @param  {Number}        frame              number of frames in a row (horizontal mode) or column (vertical mode)
 * @param  {Number}        row                number of rows (for horizontal mode)
 * @param  {Number}        column             number of rows (for vertical mode)
 * @param  {Number}        interval           time between each frame (ms)
 * @param  {String}        loopType           `forward` or 'bouncing', take effects when loop is true.
 * @param  {Boolean}       loop               whether loop or not
 * @param  {Number}        delay              interval between each loop
 */
export function createAnimation({ direction, index, file, files, frame, row = 1, column = 1, interval = 33, loopType = 'forward', loop = true, delay = 0 }) {
  const ani = new Animation();

  if (files) {
    ani.setType('multifiles').setIndex(index).setFile(files)
           .setInterval(interval).setLoop(loop).setDelay(delay)
           .exec();
  } else if (direction === 'horizontal') {
    ani.setType('horizontal').setIndex(index).setFile(file)
           .setFrame(frame).setRow(row).setInterval(interval)
           .setLoopType(loop).setDelay(delay)
           .exec();
  } else {    // vertical
    ani.setType('vertical').setIndex(index).setFile(file)
           .setFrame(frame).setColumn(column).setInterval(interval)
           .setLoopType(loop).setDelay(delay)
           .exec();
  }
  attachToSprite(ani);
  insert(index, ani);
}

/**
 * set a sprite as another sprite's child
 * @method addto
 * @param  {Number} sourceIndex the sprite will be add to parent
 * @param  {Number} targetIndex the parent sprite
 * @param  {Number} zorder    greater will be above, default to 0
 * @param  {Point} pos      coordinate relative to parent sprite, default to [0,0]
 * @param  {Number} alpha     range 0~1, default to 1.0
 */
export function addto(sourceIndex, targetIndex, zorder = 0, pos = [0, 0], alpha = 1) {
  const source = fromIndex(sourceIndex);
  const target = fromIndex(targetIndex);

  if (!source || !target) { return logger.warn('source or target does not exist, ignored.'); }
  source.x = pos[0];
  source.y = pos[1];
  source.alpha = alpha;
  target.addChild(source);
  setZorder(sourceIndex, zorder);
}

/**
 * get a sprite from index
 * @method fromIndex
 * @param  {Number}  index
 * @return {Sprite}
 */
export function fromIndex(index) {
  return Sprites.get(index);
}

/**
 * get current active TextWindow.
 * @method currentTextWindow
 * @return {Sprite}          TextWindow Sprite
 */
export function currentTextWindow() {
  return Sprite[textWindowOptions.currentIndex];
}

/**
 * insert a sprite
 * @method insert
 * @param  {String} index
 * @param  {Sprite} sprite
 */
export function insert(index, sprite) {
  sprite.index = index;
  Sprites.set(index, sprite);
}

/**
 * remove a sprite from its parent (and screen).
 * @method remove
 * @param  {Number} index
 */
export function remove(index, isDelete = true) {
  const sp = fromIndex(index);

  if (!sp || !sp.parent) { return logger.warn(`Sprite<${index}> does not exist, or it hasn't been added to screen, ignored.`); }
  sp.parent.removeChild(sp);
  if (isDelete) { Sprites.remove(index); }
}

/**
 * remove all children from a sprite
 * @method removeAll
 * @param  {Number}  index
 * @param  {Boolean} isDelete if true, the texture of the sprite will be deleted from memory, default to true
 * @param  {Boolean} isRecursive whether remove all children of each child, default to true.
 */
export function removeAll(index, isDelete = true, isRecursive = true) {
  const parent = fromIndex(index);

  if (!parent) { return logger.warn(`Sprite<${index}> does not exist, ignored.`); }
  removeRecursive(parent, isDelete);
}

function removeRecursive(children, isDelete, isRecursive) {
  for (const child of children) {
    remove(child, isDelete);
    if (isRecursive && child.children.length) { removeRecursive(child.children); }
  }
}

/**
 * prepare a transition of a sprite, any change of the sprite will not take effect until `.applyTransition()` is called.
 * @method prepareTransition
 * @param  {[type]}          index [description]
 * @return {[type]}                [description]
 */
export function prepareTransition(index) {
  const sprite = fromIndex(index);

  if (!sprite) { return logger.warn(`Sprite<${index}> does not exist, ignored.`); }
  sprite.prepareTransition(Renderer);
}

/**
 * apply a transition of a sprite.
 * @method applyTransition
 * @param  {Number}             index
 * @param  {AbstractFilter}     filter filter instance.
 * @return  {Promise}
 */
export function applyTransition(index, filter) {
  const sprite = fromIndex(index);

  if (!sprite) { return logger.warn(`Sprite<${index}> does not exist, ignored.`); }

  return sprite.startTransition(Renderer, filter);
}

/**
 * set z-order of sprites, greater will be above.
 * @method setZorder
 * @param  {Number}  index
 * @param  {Number}  value
 */
export function setZorder(index, zorder) {
  const sprite = Sprites.get(index);

  if (!sprite) { logger.warn(`Sprite<${index}> does not exist, ignored.`); } else {
    if (sprite.zorder != 0 && sprite.zorder === zorder) { return; }
    sprite.zorder = zorder;
    if (sprite.parent) {
      sprite.parent.children.sort(function (a, b) {
        a.zorder = a.zorder || 0;
        b.zorder = b.zorder || 0;

        return a.zorder - b.zorder;
      });
    }
  }
}

export function setAnchor(index, anchor) {
  const sprite = fromIndex(index);

  if (typeof anchor === 'string') {
    switch (anchor) {
      case 'center': anchor = [0.5, 0.5]; break;
      case 'topleft': anchor = [0, 0]; break;
      case 'topright': anchor = [1, 0]; break;
      case 'topcenter': anchor = [0.5, 0]; break;
      case 'leftcenter': anchor = [0, 0.5]; break;
      case 'rightcenter': anchor = [1, 0.5]; break;
      case 'bottomcenter': anchor = [0.5, 1]; break;
      case 'bottomleft': anchor = [0, 1]; break;
      case 'bottomright': anchor = [1, 1]; break;
      default: anchor = [0, 0]; break;
    }
  }
  sprite.anchor = new PIXI.Point(set[0], set[1]);
}

/**
 * playing a animation sprite.
 * @method animationCell
 * @param  {Number}      index
 */
export function animationStart(index) {
  const sprite = fromIndex(index);

  if (!sprite) { logger.warn(`Sprite<${index}> does not exist, ignored.`); } else {
    sp.start();
  }
}

/**
 * stop playing a animation sprite.
 * @method animationCell
 * @param  {Number}      index
 */
export function animationStop(index) {
  const sprite = fromIndex(index);

  if (!sprite) { logger.warn(`Sprite<${index}> does not exist, ignored.`); } else {
    sp.stop();
  }
}

/**
 * force a animation sprite in specific frame. This will stop the animation, if it is playing.
 * @method animationCell
 * @param  {Number}      index
 * @param  {Number}      frame the number of frame cell, start from 0.
 */
export function animationCell(index, frame) {
  const sprite = fromIndex(index);

  if (!sprite) { logger.warn(`Sprite<${index}> does not exist, ignored.`); } else {
    sp.cell(frame);
  }
}
