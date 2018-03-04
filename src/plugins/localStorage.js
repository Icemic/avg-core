/**
 * @file        A storage plugin using Localstorage
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

import core from 'core/core';

const logger = core.getLogger('LocalStorage');

class Localstorage {
  constructor() {
    core.use('localstorage-init', this.init.bind(this));
  }
  async init() {
    core.use('save-archive', this.save.bind(this));
    core.use('load-archive', this.load.bind(this));
    core.use('remove-archive', this.remove.bind(this));
    core.use('exist-archive', this.exist.bind(this));
    core.use('list-archive', this.list.bind(this));
    core.use('info-archive', this.info.bind(this));

    core.use('save-global', this.saveGlobal.bind(this));
    core.use('load-global', this.loadGlobal.bind(this));
  }
  async save(ctx, next) {
    ctx.data = {};
    // ctx.globalData = {};
    await next();
    logger.debug('Archive Data:', ctx.data);
    // console.log('全局存档上下文：', ctx.globalData);
    const localStorage = window.localStorage;

    localStorage.setItem(ctx.name, JSON.stringify(ctx.data));
    // localStorage.setItem('__global__', JSON.stringify(ctx.data));

    const archiveInfo = JSON.parse(localStorage.getItem('__archiveInfo__')) || {};

    archiveInfo[ctx.name] = {
      time: Date.now(),
      extra: JSON.stringify(ctx.extra),
    };
    localStorage.setItem('__archiveInfo__', JSON.stringify(archiveInfo));
  }
  async saveGlobal(ctx, next) {
    ctx.globalData = {};
    await next();
    logger.debug('Global archive Data:', ctx);
    const localStorage = window.localStorage;

    localStorage.setItem('__global__', JSON.stringify(ctx.globalData));
  }
  async load(ctx, next) {
    const localStorage = window.localStorage;

    ctx.data = JSON.parse(localStorage.getItem(ctx.name));
    ctx.globalData = JSON.parse(localStorage.getItem('__global__')) || {};

    const archiveInfo = JSON.parse(localStorage.getItem('__archiveInfo__')) || {};
    const info = archiveInfo[ctx.name];

    ctx.time = info.time;
    ctx.extra = JSON.parse(info.extra || null);

    await next();
  }
  async loadGlobal(ctx, next) {
    const localStorage = window.localStorage;

    ctx.globalData = JSON.parse(localStorage.getItem('__global__')) || {};

    await next();
  }
  async remove(ctx, next) {
    const localStorage = window.localStorage;

    localStorage.removeItem(ctx.name);

    const archiveInfo = JSON.parse(localStorage.getItem('__archiveInfo__')) || {};

    delete archiveInfo[ctx.name];
    localStorage.setItem('__archiveInfo__', JSON.stringify(archiveInfo));

    await next();
  }
  async exist(ctx, next) {
    const localStorage = window.localStorage;

    ctx.exist = localStorage.hasOwnProperty(ctx.name);
    await next();
  }
  async list(ctx, next) {
    const localStorage = window.localStorage;

    ctx.list = Object.keys(localStorage);
    await next();
  }
  async info(ctx, next) {
    const localStorage = window.localStorage;
    const archiveInfo = JSON.parse(localStorage.getItem('__archiveInfo__')) || {};
    const keys = ctx.keys || Object.keys(archiveInfo || {});
    const data = {};

    for (const key of keys) {
      const { time, extra } = archiveInfo[key];

      data[key] = {
        time,
        extra: JSON.parse(extra || null),
      };
    }
    ctx.infos = data;
    await next();
  }
}

const localStorage = new Localstorage();

export default localStorage;
