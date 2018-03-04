/**
 * @file        Surface component
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

import React from 'react';
import PropTypes from 'prop-types';
import ReactUpdates from 'react-dom/lib/ReactUpdates';
import ReactInstanceMap from 'react-dom/lib/ReactInstanceMap';
import ContainerMixin from 'components/ContainerMixin';

import core from 'core/core';

/**
 * Surface is a standard React component and acts as the main drawing canvas.
 * ReactCanvas components cannot be rendered outside a Surface.
 */
export class Surface extends React.PureComponent {
  // mixins: [ContainerMixin],
  static propTypes = {
    children: PropTypes.any
  };
  constructor(props) {
    super(props);

    Object.assign(this, ContainerMixin);
  }
  componentDidMount() {
    this.node = core.getStage();

    // This is the integration point between custom canvas components and React
    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();

    transaction.perform(
      this.mountAndInjectChildren,
      this,
      this.props.children,
      transaction,
      ReactInstanceMap.get(this)._context
    );
    ReactUpdates.ReactReconcileTransaction.release(transaction);
  }

  componentDidUpdate() {
    // We have to manually apply child reconciliation since child are not
    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();

    transaction.perform(
      this.updateChildren,
      this,
      this.props.children,
      transaction,
      ReactInstanceMap.get(this)._context
    );
    ReactUpdates.ReactReconcileTransaction.release(transaction);
  }

  componentWillUnmount() {
    // Implemented in ReactMultiChild.Mixin
    this.unmountChildren();
    this.node.removeChildren();
  }

  render() {
    return null;
  }
}

// module.exports = Surface;
