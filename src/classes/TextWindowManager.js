/**
 * @file        Textwindow manager
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
import TextWindow from './TextWindow';

const logger = core.getLogger('TextwindowManager');

const SpriteManager = null;
let CurrentTextWindow = null;

const Methods = {
  create(index) {
    let textwindow = SpriteManager.fromIndex(index);

    if (textwindow && !(textwindow instanceof TextWindow)) {
      logger.warn(`Index<${index}> is not empty,
        which may be an other kind of Sprite. However, it will be destroyed to create a new TextWindow.`);
      textwindow.destroy();
    } else if (textwindow) {
      logger.warn(`Index<${index}> has been used by a TextWindow, ignored.`);

      return;
    }
    textwindow = CurrentTextWindow.clone();
    textwindow.setIndex(index);
    textwindow.clearText();

    SpriteManager.insert(index, textwindow);
    SpriteManager.addto(index, -1, 50);
  },
  switchTo(index) {
    const textwindow = SpriteManager.fromIndex(index);

    if (textwindow && textwindow instanceof TextWindow) { CurrentTextWindow = textwindow; } else { logger.warn(`Index<${index}> does not exist, or it is not a TextWindow, ignored.`); }
  },
};

export default function Manager(SpriteManager) {
  // create default textwindow
  const textwindow = new TextWindow();

  textwindow.setIndex(-2);
  SpriteManager.insert(-2, textwindow);
  SpriteManager.addto(-2, -1, 50);
  CurrentTextWindow = textwindow;

  // return new Proxy(Methods, {
  //   get: function(target, property, receiver) {
  //     if (target.hasOwnProperty(property)) {
  //       // console.log(`getting ${property} from Methods!`);
  //       return Reflect.get(target, property, receiver);
  //     }
  //     else {
  //       // console.log(`getting ${property} from CurrentTextWindow!`);
  //       return Reflect.get(CurrentTextWindow, property, CurrentTextWindow);
  //     }
  //   },
  //   set: function(target, key, value, receiver) {
  //     // console.log(`setting ${key}!`);
  //     return Reflect.set(CurrentTextWindow, key, value, CurrentTextWindow);
  //   }
  // })
}
