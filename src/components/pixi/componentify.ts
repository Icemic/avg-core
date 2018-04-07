/**
 * @file        General image component
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

import upperFirst from 'lodash/upperFirst';

import React from 'react';
import ContainerMixin from '../ContainerMixin';
import createComponent from '../createComponent';
import NodeMixin from '../NodeMixin';
import pixiPropTypes from './propTypes';

export default function componentify(name: string, lifeCycle: any, propTypes = {}): any {
  const compName = upperFirst(name);
  const Raw = createComponent(`Raw${compName}`, ContainerMixin, NodeMixin, lifeCycle);

  class Component extends React.PureComponent {
    public static displayName = compName;
    public static propTypes = {
      ...pixiPropTypes,
      ...propTypes,
    };
    public render() {
      return React.createElement(Raw, this.props, this.props.children);
    }
  }

  return Component;
}
