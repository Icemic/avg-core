/**
 * @file        core
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

import Color from 'color';
import * as EventEmitter from 'eventemitter3';
// import FontFaceObserver from 'fontfaceobserver';
import { render as renderReact } from 'react-dom';
// import Container from '../classes/Container';
import { attachToSprite } from '../classes/EventManager';
import { compose } from '../utils/compose';
import fitWindow from '../utils/fitWindow';
import sayHello from '../utils/sayHello';
import Logger from './logger';

import { action, connect, member } from './framework';
import { getTexture, init as preloaderInit, load as loadResources } from './preloader';
import Ticker from './ticker';

// const PIXI = require('pixi.js');
import * as PIXI from 'pixi.js';
const isMobile = require('ismobilejs');

const logger = Logger.create('Core');

export interface Options {
  // fontFamily?: string
  renderer?: PIXI.WebGLRenderer;
  view?: HTMLCanvasElement;
  fitWindow?: boolean;
  assetsPath?: string;
  tryWebp?: boolean;
  backgroundColor?: string;
}

/**
 * Core of AVG.js, you can start your game development from here.
 *
 * @class
 * @memberof AVG
 */
@connect('plugin', 'core')
export class Core extends EventEmitter {
  private _init: boolean;
  private _tickTime: number;
  public renderer: PIXI.WebGLRenderer | null;
  public stage: PIXI.Container | null;
  public canvas: HTMLCanvasElement | null;
  public options: Options;
  private middlewares: { [name: string]: Array<(context: {}, next: () => Promise<any>) => any> };
  private plugins: { [name: string]: object };
  private assetsPath: string | null;
  private ticker!: Ticker;

  @member() public width: number = 1280;
  @member() public height: number = 720;
  @member() public isAssetsLoading: boolean = false;
  @member() public assetsLoadingProgress: number = 0;
  @member() public clickEvent: object = {};
  constructor() {
    super();

    /**
     * @type {Boolean}
     * @private
     * @readonly
     */
    this._init = false;
    this._tickTime = 0;

    this.renderer = null;
    this.stage = null;
    this.canvas = null;

    this.options = {};

    /**
     * Currently used middleware
     * @member {object<string, function[]>}
     * @default {}
     * @private
     */
    this.middlewares = {};
    this.plugins = {};

    this.assetsPath = null;
  }

  @action()
  public setScreenSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  @action()
  public setAssetsLoading(value: boolean) {
    this.isAssetsLoading = value;
  }

  @action()
  public setAssetsLoadingProgress(value: number) {
    this.assetsLoadingProgress = value;
  }

  @action()
  public setClickEvent(e: Event) {
    this.clickEvent = e;
  }

  /**
   * install a middleware.
   *
   * @param {string} name signal name
   * @param {function} middleware instance of middleware
   * @see AVG.core.Middleware
   */
  public use(name: string, middleware: (context: {}, next: () => Promise<any>) => any) {
    let middlewares: Array<(context: {}, next: () => Promise<any>) => any>;

    if (!this.middlewares[name]) {
      middlewares = [];
      this.middlewares[name] = middlewares;
    } else {
      middlewares = this.middlewares[name];
    }
    middlewares.push(middleware);
  }

  /**
   * uninstall a middleware.
   *
   * @param {string} name signal name
   * @param {function} middleware instance of middleware
   * @see AVG.core.Middleware
   */
  public unuse(name: string, middleware: (context: {}, next: () => Promise<any>) => any) {
    const middlewares = this.middlewares[name];

    if (middlewares) {
      const pos = middlewares.indexOf(middleware);

      if (pos !== -1) {
        middlewares.splice(pos, 1);
      } else {
        logger.warn(`Do not find the given middleware in ${name}.`);
      }
    } else {
      logger.warn(`Do not find the given middleware in ${name}.`);
    }
  }

  /**
   * send a signal to core
   *
   * @param {string} name signal name
   * @param {object} [context={}] context to process
   * @param {function} next
   * @return {promise}
   */
  public post(name: string, context: object, next: (...args: any[]) => any) {
    const middlewares = this.middlewares[name];

    if (middlewares) {
      return compose(middlewares)(context || {}, next);
    }

    return Promise.resolve();
  }

  /**
   * install a plugin
   *
   * @param {any} constructor plugin class
   *
   * @memberOf Core
   */
  public installPlugin(constructor: (new (...args: any[]) => any)) {
    /* tslint:disable-next-line */
    new constructor(this);
  }

  /**
   *
   * install a plugin
   *
   * @param {any} name
   * @param {any} constructor
   * @memberof Core
   */
  public install(name: string, constructor: (new (...args: any[]) => any)) {
    const instance = new constructor(this);

    this.plugins[name] = instance;
  }

  /**
   * Initial AVG.js core functions
   *
   * @param {number} width width of screen
   * @param {number} height height of screen
   * @param {object} [options]
   * @param {HTMLCanvasElement} [options.view] custom canvas element
   * @param {PIXI.WebGLRenderer} [options.renderer] custom renderer
   * @param {string|array<string>} [options.fontFamily] load custom web-font
   * @param {boolean} [options.fitWindow=false] auto scale canvas to fit window
   * @param {string} [options.assetsPath='assets'] assets path
   * @param {string} [options.tryWebp=false] auto replace image file extension with .webp format when webp is supported by browser
   */
  public async init(width: number, height: number, options: Options = {}) {
    if (this._init) {
      return;
    }
    const _options: Options = {
      fitWindow: false,
      assetsPath: '/',
      tryWebp: false,
      backgroundColor: '#ffffff',
      ...options,
    };

    this.setScreenSize(width, height);

    // if (_options.fontFamily) {
    //   const font = new FontFaceObserver(_options.fontFamily);

    //   await font.load();
    // }

    if (_options.renderer) {
      this.renderer = _options.renderer;
    } else {

      /* create PIXI renderer */
      if (isMobile.any) {
        PIXI.settings.RESOLUTION = 1;
        PIXI.settings.TARGET_FPMS = 0.03;
      } else {
        PIXI.settings.RESOLUTION = window.devicePixelRatio || 1;
      }
      this.renderer = new PIXI.WebGLRenderer(width, height, {
        view: _options.view,
        autoResize: true,
        backgroundColor: Color(_options.backgroundColor).rgbNumber(),
        // resolution: 2,
        roundPixels: true,
      });
    }

    this.options = _options;

    if (_options.fitWindow) {
      window.addEventListener('resize', () => {
        fitWindow(this.renderer as PIXI.WebGLRenderer, window.innerWidth, window.innerHeight);
      });
      fitWindow(this.renderer as PIXI.WebGLRenderer, window.innerWidth, window.innerHeight);
    }

    let assetsPath = _options.assetsPath;

    if (!(assetsPath as string).endsWith('/')) {
      assetsPath += '/';
    }
    this.assetsPath = assetsPath as string;
    preloaderInit(assetsPath as string, _options.tryWebp as boolean);

    this.stage = new PIXI.Container();
    attachToSprite(this.stage as PIXI.DisplayObject);
    // this.stage._ontap = e => this.post('tap', e);
    // this.stage._onclick = e => this.post('click', e);
    (this.stage as any)._ontap = (e: Event) => this.setClickEvent(e);
    (this.stage as any)._onclick = (e: Event) => this.setClickEvent(e);

    this.ticker = new Ticker();
    this.ticker.add(this.tick.bind(this));
    sayHello();
    this._init = true;
  }

  public getRenderer() {
    if (this._init && this.renderer) {
      return this.renderer;
    }
    logger.error('Renderer hasn\'t been initialed.');

    throw new Error('Renderer hasn\'t been initialed.');
  }
  public getStage() {
    if (this._init && this.stage) {
      return this.stage;
    }
    logger.error('Stage hasn\'t been initialed.');

    throw new Error('Stage hasn\'t been initialed.');
  }
  public getAssetsPath() {
    return this.assetsPath;
  }
  public getTexture(url: string) {
    return getTexture(url);
  }

  /**
   * create a logger for specific name
   *
   * @param {string} name
   * @return {Logger} logger instance
   */
  public getLogger(name: string) {
    return Logger.create(name);
  }

  // TODO: move to actions
  public async loadAssets(list: string[]) {
    this.setAssetsLoading(true);
    await loadResources(list, (e: any) => this.setAssetsLoadingProgress(e.progress));
    this.setAssetsLoading(false);
  }

  /**
   * render surface to page.
   *
   * @param {React.Component} component
   * @param {HTMLDOMElement} target
   * @param {boolean} append whether append canvas element to target
   * @return {Promise}
   */
  public async render(component: React.Component, target: HTMLDocument, append = true) {
    if (!this._init) {
      throw Error('not initialed');
    }

    return new Promise((resolve) => {
      renderReact(component, target as any, resolve as any);
    }).then(() => {
      append && target.appendChild((this.renderer as PIXI.WebGLRenderer).view);
    });
  }

  /**
   * Get ticker of AVG.js render loop
   *
   * @return {PIXI.ticker.Ticker} shared ticker
   */
  public getTicker() {
    return this.ticker;
  }

  /**
   * @private
   */
  public tick(deltaTime: number) {
    this._tickTime += deltaTime;
    if (this._init && this._tickTime > 0.98) {
      (this.renderer as PIXI.WebGLRenderer).render(this.stage as PIXI.DisplayObject);
      this._tickTime = 0;
      (window as any).stats && (window as any).stats.update();
    }
  }

  /**
   * start rendering, this must be called if you want to start your game.
   */
  public start() {
    this.ticker.start();
  }

  /**
   * stop rendering
   */
  public stop() {
    this.ticker.stop();
  }
}

/**
 * @export
 * @type {Core}
 */
const coreInstance = new Core();
// Object.freeze(core);

export default coreInstance;
