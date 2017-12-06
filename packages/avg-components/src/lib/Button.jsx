/**
 * @file        Button component
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

import { tools, PropTypes } from 'avg-core';
import PixiButton from 'class/button';

const propTypes = {

};

const Button = tools.componentify('Button', {
  createNode() {
    this.node = new PixiButton();
  },
  mountNode(props) {
    const node = this.node;

    tools.setValue.call(node, 'frames', props.frames);
    tools.setValue.call(node, 'lite', props.lite);
    tools.mountNode(node, props);

    return node;
  },
  updateNode(prevProps, props) {
    const node = this.node;

    tools.updateValue.call(node, 'frames', prevProps.frames, props.frames);
    tools.updateValue.call(node, 'lite', prevProps.lite, props.lite);
    tools.updateNode(node, prevProps, props);
  }
}, propTypes);

export default Button;
