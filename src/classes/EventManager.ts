/**
 * @file        General event handle module
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

import * as PIXI from "pixi.js";
import { MouseEvent } from "react";

export function attachToSprite(sprite: PIXI.DisplayObject) {
  sprite.interactive = true;
  sprite.on("click", handleEvent);
  sprite.on("tap", handleEvent);
  sprite.on("mousemove", handleEvent);
  sprite.on("mouseover", handleEvent);
  sprite.on("mouseout", handleEvent);
  sprite.on("mousedown", handleEvent);
  sprite.on("mouseup", handleEvent);
  sprite.on("mouseupoutside", handleEvent);
  sprite.on("touchstart", handleEvent);
  sprite.on("touchmove", handleEvent);
  sprite.on("touchend", handleEvent);
  sprite.on("touchendoutside", handleEvent);

  sprite.on("pointerover", pointerHandler);
  // sprite.on('pointerenter', pointerHandler);
  sprite.on("pointerdown", pointerHandler);
  sprite.on("pointermove", pointerHandler);
  sprite.on("pointerup", pointerHandler);
  sprite.on("pointerupoutside", pointerHandler);
  sprite.on("pointercancel", pointerHandler);
  sprite.on("pointerout", pointerHandler);
  // sprite.on('pointerleave', pointerHandler);
  sprite.on("pointertap", pointerHandler);
}

class EventData {
  public type: string;
  public originalEvent: PIXI.interaction.InteractionEvent;
  public target: PIXI.DisplayObject;
  public currentTarget: PIXI.DisplayObject;
  public global: PIXI.Point;
  public local?: PIXI.Point;
  public movement?: { x: number, y: number };
  private _preventDefault: boolean;
  constructor(evt: PIXI.interaction.InteractionEvent) {
    this.type = evt.type;
    this._preventDefault = false;
    this.originalEvent = evt;
    // this.index = evt.target.index;
    this.target = evt.target;
    this.currentTarget = evt.currentTarget;
    this.global = evt.data.global;
    this.local = evt.currentTarget ? evt.currentTarget.toLocal(this.global) : undefined;

    // 有时候会有奇怪的触发，导致 data.originalEvent 是 null……
    if (evt.data.originalEvent) {
      this.movement = {
        x: (evt.data.originalEvent as any).movementX,
        y: (evt.data.originalEvent as any).movementY,
      };
    } else {
      this.movement = { x: 0, y: 0 };
    }
  }
  public preventDefault() {
    this._preventDefault = true;
  }
  public stopPropagation() {
    this.originalEvent.stopped = true;
  }
}

// let Handler;
// export function registerHandler(handler) {
//   if (typeof handler === 'function')
//     Handler = handler;
//   else {
//     Err.warn('[EventManager] Event Handler must be a function, ignored.');
//   }
// }

function handleEvent(evt: PIXI.interaction.InteractionEvent) {
  const e = new EventData(evt);
  const handler = e.currentTarget ? (e.currentTarget as any)[`_on${e.type}`] : null;

  handler && handler(e);
}

function pointerHandler(evt: PIXI.interaction.InteractionEvent) {
  const e = new EventData(evt);
  // console.log(e.type)
  const defaultHandler = e.currentTarget ? (e.currentTarget as any)[`_on${e.type}`] : null;

  defaultHandler && defaultHandler(e);
}
