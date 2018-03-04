/**
 * @file        Plugin to enable transition to node.
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

// const logger = core.getLogger('Transition Plugin');

class TransitionPlugin {
  constructor(node, method) {
    this.node = node;
    this.method = method;
    this.clickCallback = false;
    this.unskippable = false;

    core.use('script-trigger', async (ctx, next) => {
      if (this.clickCallback && !this.unskippable) {
        this.node.completeImmediate();
        this.clickCallback = false;
        this.unskippable = false;
      } else {
        await next();
      }
    });
  }
  static wrap(node, method) {
    const wrapped = new TransitionPlugin(node, method);

    return wrapped.process.bind(wrapped);
  }
  async process(ctx, next) {
    const layer = this.node;
    const method = this.method;

    const { flags, params } = ctx;

    const isSkip = flags.includes('_skip_');

    if (flags.includes('pretrans')) {
      // const renderer = core.getRenderer();

      if (layer.transitionStatus !== 'prepare') {
        // layer.transitionStatus = 'prepare';
        layer.prepare();
      }

      return method(ctx, next);
    } else if (flags.includes('trans') || params.trans) {
      params.method = params.method || 'crossfade';
      // const renderer = core.getRenderer();

      if (layer.transitionStatus !== 'prepare') {
        // layer.transitionStatus = 'prepare';
        layer.prepare();
      }
      await method(ctx, next);
      // layer.transitionStatus = 'start';
      const promise = layer.start(params.method, params)
        .then(() => (layer.transitionStatus = null));

      this.clickCallback = true;

      if (flags.includes('unskippable')) {
        this.unskippable = true;
      }

      // FIXME
      if (layer.visible && !flags.includes('nowait') && !isSkip) {
        await promise;
      }

      if (isSkip) {
        layer.completeImmediate();
      }

      this.clickCallback = false;

    } else {
      return method(ctx, next);
    }

    return Promise.resolve();
  }
}

export default function transition(node, execute) {
  const wrapped = new TransitionPlugin(node, execute);

  return wrapped.process.bind(wrapped);
}
