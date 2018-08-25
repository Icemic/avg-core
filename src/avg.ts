/**
 * @file        Main export of the AVG.js library
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

import 'babel-polyfill';

/**
 * @namespace AVG
 */
// import * as components from './components';
// import * as ui from './components/ui';
// import * as plugins from './plugins';

import { observer } from 'mobx-react/custom';
import { flow } from 'mobx-state-tree';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import tools from './components/componentUtils';
import findPixiNode from './components/findPixiNode';
import findPixiNodeByName from './components/findPixiNodeByName';
import Surface from './components/Surface';
import core from './core/core';
import { action, autorun, connect, globalStore, member, property, reaction, when } from './core/framework';

export {
  React,
  Component,
  PropTypes,
  core,
  Surface,
  // components,
  // ui,
  // plugins,
  // stateTree,
  globalStore,
  findPixiNode,
  findPixiNodeByName,
  // define,
  connect,
  action,
  member,
  property,
  autorun,
  when,
  reaction,
  // getEnv,
  tools,
  observer,
  // reaction,
  // flow,
};
