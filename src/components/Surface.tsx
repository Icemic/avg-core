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

import * as PIXI from 'pixi.js';
import PropTypes from 'prop-types';
import React from 'react';
import ContainerMixin from '../components/ContainerMixin';
import { ReactInstanceMap, ReactUpdates } from './reactdom';

import core from '../core/core';

/**
 * Surface is a standard React component and acts as the main drawing canvas.
 * ReactCanvas components cannot be rendered outside a Surface.
 */
export default class Surface extends React.Component {
  // mixins: [ContainerMixin],
  public static propTypes = {
    children: PropTypes.any,
  };
  constructor(...args: any[]) {
    super(...args);

    // Object.assign(this, ContainerMixin);
  }
  private node!: PIXI.Container;
  private mountAndInjectChildren!: (...args: any[]) => any;
  private updateChildren!: (...args: any[]) => any;
  private unmountChildren!: (...args: any[]) => any;
  public componentDidMount() {
    this.node = core.getStage();

    // This is the integration point between custom canvas components and React
    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();

    transaction.perform(
      this.mountAndInjectChildren,
      this,
      this.props.children,
      transaction,
      ReactInstanceMap.get(this)._context,
    );
    ReactUpdates.ReactReconcileTransaction.release(transaction);
  }

  public componentDidUpdate() {
    // We have to manually apply child reconciliation since child are not
    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();

    transaction.perform(
      this.updateChildren,
      this,
      this.props.children,
      transaction,
      ReactInstanceMap.get(this)._context,
    );
    ReactUpdates.ReactReconcileTransaction.release(transaction);
  }

  public componentWillUnmount() {
    // Implemented in ReactMultiChild.Mixin
    this.unmountChildren();
    this.node.removeChildren();
  }

  public render() {
    return null;
  }
}

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
          derivedCtor.prototype[name] = baseCtor.prototype[name];
      });
  });
}

applyMixins(Surface, [ContainerMixin]);

// module.exports = Surface;
