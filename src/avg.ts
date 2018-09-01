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

import { observer } from 'mobx-react/custom';
import React, { Component } from 'react';
import BaseComponent, { IBaseProperties } from './components/BaseComponent';
import findPixiNode from './components/findPixiNode';
import findPixiNodeByName from './components/findPixiNodeByName';
import Surface from './components/Surface';
import core from './core/core';
import { action, autorun, connect, event, globalStore, member, property, reaction, when } from './core/framework';

export {
  React,
  Component,
  core,
  Surface,
  BaseComponent,
  IBaseProperties,
  globalStore,
  findPixiNode,
  findPixiNodeByName,
  connect,
  action,
  member,
  property,
  autorun,
  when,
  reaction,
  event,
  observer,
};
