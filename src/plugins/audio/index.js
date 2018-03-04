/**
 * @file        Audio Plugin
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

import * as manager from './manager';

export default class Audio {
  constructor(core) {

    if (!core.plugins.audio) {
      core.use('script-exec', this.exec.bind(this));
      core.use('save-archive', this.save.bind(this));
      core.use('load-archive', this.load.bind(this));
      core.plugins.audio = manager;
    }

  }

  /**
  * @method exec
  * @async
  * @private
  * @param  {object} ctx
  * @param  {Function} next
  */
  async exec(ctx, next) {
    const { command, flags, params } = ctx;

    if (command === 'sound') {
      let channel = params.channel;

      if (flags.includes('bgm')) {
        channel = 'bgm';
      } else if (flags.includes('se')) {
        channel = 'se';
      } else if (flags.includes('voice')) {
        channel = 'voice';
      }
      const wait = flags.includes('wait');
      let promise = Promise.resolve();

      if (channel != null) {
        if (flags.includes('play')) {
          promise = manager.play(channel);
        } else if (flags.includes('pause')) {
          promise = manager.pause(channel);
        } else if (flags.includes('stop')) {
          promise = manager.stop(channel);
        } else if (flags.includes('mute')) {
          promise = manager.mute(channel, params.value);
        } else if (flags.includes('rate')) {
          promise = manager.mute(channel, params.value);
        } else if (flags.includes('fade')) {
          promise = manager.fade(channel, params.from, params.to, params.duration);
        } else if (flags.includes('fadein')) {
          promise = manager.fadeIn(channel, params.to, params.duration);
        } else if (flags.includes('fadeout')) {
          promise = manager.fadeOut(channel, params.duration);
        } else if (flags.includes('volume')) {
          promise = manager.volume(channel, params.value);
        } else if (flags.includes('seek')) {
          promise = manager.seek(channel, params.value);
        } else if (flags.includes('loop')) {
          promise = manager.loop(channel, params.value);
        } else if (flags.includes('destroy')) {
          promise = manager.destroy(channel);
        } else {
          promise = manager.create(channel, params.src, {
            volume: (params.volume === 0 ? 0 : params.volume) || 1,
            loop: params.loop || false,
            preload: true,
            autoplay: (typeof params.autoplay === 'boolean') ? params.autoplay : true,
            mute: params.mute || false,
            rate: params.rate || 1,
            autounload: params.autounload || true,
            exclusive: (typeof params.exclusive === 'boolean') ? params.exclusive : true
          });
        }
      } else if (!channel) {
        if (flags.includes('mute')) {
          manager.globalMute(params.value);
        } else if (flags.includes('volume')) {
          manager.globalVolume(params.value);
        } else if (flags.includes('stopall')) {
          promise = manager.stopAll();
        }
      }

      await (wait ? promise : Promise.resolve());
    } else {
      await next();
    }
  }
  // eslint-disable-next-line
  async save(ctx, next) {
    ctx.data.audio = manager.getSaveData();
    await next();
  }
  // eslint-disable-next-line
  async load(ctx, next) {
    const data = ctx.data.audio;

    manager.setSaveData(data);
    await next();
  }
}
