/**
 * @file        Audio Manager
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

import { Howl, Howler } from 'howler';

let Pool = {};
let ChannelVolume = {};

export function channelExist(channel) {
  return !!Pool[channel];
}

export function channelVolume(channel, vol) {
  if (typeof vol === 'number') {
    const prevVol = ChannelVolume[channel];
    const sound = Pool[channel];

    ChannelVolume[channel] = vol;
    if (sound) {
      sound.volume(sound.volume() / prevVol * vol);
    }
  }

  return ChannelVolume[channel];
}

export function globalVolume(vol) {
  return Howler.volume(vol);
}

export function globalMute(muted) {
  return Howler.muted(muted);
}

export function create(channel, src, options = {}) {
  const _options = {
    volume: 1,
    loop: false,
    preload: true,
    autoplay: true,
    mute: false,
    rate: 1,
    autounload: true,
    exclusive: true,
    ...options
  };

  if (_options.exclusive && channelExist(channel)) {
    destroy(channel);
  }

  const channelVolume = ChannelVolume[channel] || 1.0;
  const sound = new Howl({
    src,
    ..._options,
    volume: _options.volume * channelVolume
  });

  if (_options.autounload) {
    const autoUnload = () => {
      if (!sound.loop()) {
        destroy(channel);
      }
    };

    sound.on('end', autoUnload);
    sound.on('stop', autoUnload);
  }

  sound.autounload = _options.autounload;
  sound.exclusive = _options.exclusive;

  Pool[channel] = sound;

  return Pool[channel];
}

export function destroy(channel) {
  if (channelExist(channel)) {
    Pool[channel].off();
    Pool[channel].unload();
    delete Pool[channel];
  }
}

export function getByChannel(channel) {
  return Pool[channel];
}

export function play(channel) {
  const sound = getByChannel(channel);

  if (sound) {
    sound.play();

    return new Promise(resolve => {
      sound.once('play', resolve);
    });
  }

  return Promise.resolve();
}

export function pause(channel) {
  const sound = getByChannel(channel);

  if (sound) {
    sound.pause();

    return new Promise(resolve => {
      sound.once('pause', resolve);
    });
  }

  return Promise.resolve();
}

export function stop(channel) {
  const sound = getByChannel(channel);

  if (sound) {
    sound.stop();

    return new Promise(resolve => {
      sound.once('stop', resolve);
    });
  }

  return Promise.resolve();
}

export function mute(channel, muted) {
  const sound = getByChannel(channel);

  if (sound) {
    sound.mute(muted);

    return new Promise(resolve => {
      sound.once('mute', resolve);
    });
  }

  return Promise.resolve();
}

export function volume(channel, vol) {
  const sound = getByChannel(channel);
  const channelVolume = ChannelVolume[channel] || 1.0;

  if (sound && vol != null) {
    sound.volume(vol * channelVolume);

    return new Promise(resolve => {
      sound.once('volume', resolve);
    });
  } else if (sound) {
    return sound.volume();
  }

  return NaN;
}

export function fade(channel, from = 0, to = 1, duration) {
  const sound = getByChannel(channel);
  const channelVolume = ChannelVolume[channel] || 1.0;

  if (sound) {
    sound.fade(from * channelVolume, to * channelVolume, duration);

    return new Promise(resolve => {
      sound.once('fade', resolve);
    });
  }

  return Promise.resolve();
}

export function fadeIn(channel, to, duration) {
  return play(channel)
  .then(() => fade(channel, 0, to, duration));
}

export function fadeOut(channel, duration) {
  const sound = getByChannel(channel);
  const from = (sound && sound.volume()) || 1.0;

  return fade(channel, from, 0, duration)
  .then(() => stop(channel));
}

export function rate(channel, rate) {
  const sound = getByChannel(channel);

  if (sound && rate != null) {
    sound.rate(rate);

    return new Promise(resolve => {
      sound.once('rate', resolve);
    });
  } else if (sound) {
    return sound.rate();
  }

  return Promise.resolve();
}

export function seek(channel, position) {
  const sound = getByChannel(channel);

  if (sound && position != null) {
    sound.seek(position);

    return new Promise(resolve => {
      sound.once('seek', resolve);
    });
  } else if (sound) {
    return sound.seek();
  }

  return Promise.resolve();
}

export function loop(channel, loop) {
  const sound = getByChannel(channel);

  if (sound && loop != null) {
    sound.loop(loop);

    return new Promise(resolve => {
      sound.once('loop', resolve);
    });
  } else if (sound) {
    return sound.loop();
  }

  return Promise.resolve();
}

export function stopAll() {
  const channels = Object.keys(Pool);
  const promises = [];

  for (const channel of channels) {
    const sound = getByChannel(channel);

    if (sound) {
      sound.stop();

      promises.push(new Promise(resolve => {
        sound.once('stop', resolve);
      }));
    }
  }

  return Promise.all(promises);
}

/* for save and load */

export function getSaveData() {
  const globalMuted = Howler._muted;
  const globalVolume = Howler._volume;

  const channels = Object.keys(Pool);
  const channelData = [];

  for (const channel of channels) {
    const sound = Pool[channel];
    const channelVolume = ChannelVolume[channel] || 1.0;

    let pos = sound.seek();

    if (typeof pos !== 'number') {
      pos = 0;
    }

    channelData.push({
      channel,
      src: sound._src,
      volume: sound.volume() / channelVolume,
      loop: sound.loop(),
      autoplay: sound._autoplay,
      mute: sound._muted,
      rate: sound.rate(),
      paused: !sound.playing(),
      ended: !sound.playing(),
      position: pos,
      autounload: sound.autounload,
      exclusive: sound.exclusive
    });
  }

  return {
    globalMuted,
    globalVolume,
    channelVolume: ChannelVolume,
    channelData
  };
}

export function setSaveData(data) {
  Howler.unload();
  Pool = {};

  Howler.mute(data.globalMuted);
  Howler.volume(data.globalVolume);

  ChannelVolume = data.channelVolume;

  const channelData = data.channelData;

  for (const item of channelData) {
    create(item.channel, item.src, {
      volume: item.volume,
      loop: item.loop,
      autoplay: false,
      mute: item.mute,
      rate: item.rate
    });

    // Pool[item.channel].seek(item.seek);

    if (item.ended) {
      // do nothing
    } else if (item.paused) {
      // do nothing
    // } else if (!item.autoplay && item.seek === 0) {
      // do noting
    } else {

      /**
       * not ended &&
       * not paused &&
       * autoplay is false but seek is not zero
       * or autoplay is true
       */

      play(item.channel);
    }
  }
}
