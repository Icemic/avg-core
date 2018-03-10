/**
 * @file        General resource preloader class
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

import * as PIXI from "pixi.js";

interface TextureMap {
  [path: string]: PIXI.Texture;
}

let TEXTURES: TextureMap = {};
const AUDIOS: any = {};
const VIDEOS: any = {};
// const SCRIPTS = {};
let HOST = "/";
let TRYWEBP = false;

const isSafari = ((navigator.userAgent.indexOf("Safari") !== -1)
  && (navigator.userAgent.indexOf("Chrome") === -1)
  && navigator.userAgent.indexOf("Android") === -1)
  || navigator.userAgent.indexOf("iPhone") !== -1
  || navigator.userAgent.indexOf("iPad") !== -1;

const Resource = PIXI.loaders.Loader.Resource;

Resource.setExtensionLoadType("wav", Resource.LOAD_TYPE.AUDIO);
Resource.setExtensionLoadType("mp3", Resource.LOAD_TYPE.AUDIO);
Resource.setExtensionLoadType("ogg", Resource.LOAD_TYPE.AUDIO);

Resource.setExtensionLoadType("mp4", Resource.LOAD_TYPE.VIDEO);
Resource.setExtensionLoadType("webm", Resource.LOAD_TYPE.VIDEO);

Resource.setExtensionXhrType("bkc", Resource.XHR_RESPONSE_TYPE.JSON);
Resource.setExtensionXhrType("bks", Resource.XHR_RESPONSE_TYPE.TEXT);

Resource.setExtensionXhrType("ttf", Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType("otf", Resource.XHR_RESPONSE_TYPE.BUFFER);

function changeExtension(filename: string, ext: string) {
  const basename = filename.substr(0, filename.lastIndexOf("."));

  return `${basename}.${ext}`;
}

export function init(host: string, tryWebp: boolean) {
  TEXTURES = {};
  HOST = host || HOST;
  TRYWEBP = !!tryWebp;
}

export function load(resources: string[], onProgress: (...args: any[]) => any) {
  const loader = new PIXI.loaders.Loader(HOST);

  if (resources && resources.length) {

    for (const res of [...new Set(resources)]) {
      if (isSafari || !TRYWEBP) {
        loader.add(res, res);
      } else {
        loader.add(res, changeExtension(res, "webp"));
      }
    }
    const promise = new Promise((resolve, reject) => {
      loader.once("complete", resolve);
      loader.once("error", reject);
      loader.on("progress", onProgress);
    });

    loader.load((self: PIXI.loaders.Loader, retResources: any) => {
      // `resources` is a Object
      for (const name in retResources) {
        const res = retResources[name];

        if (res.type === Resource.TYPE.IMAGE || res.isImage) {
          TEXTURES[name] = res.texture;
        } else if (res.type === Resource.TYPE.AUDIO || res.isAudio) {
          // audio object
          AUDIOS[name] = res.data;
        } else if (res.type === Resource.TYPE.VIDEO || res.isVideo) {
          VIDEOS[name] = res.data;
        }
      }
      // Object.assign(TEXTURES, resources);
    });

    return promise;

  } else {
    return Promise.resolve();
  }
}

export function getTexture(url = "") {
  let obj = TEXTURES[url];

  if (!obj) {
    if (url.startsWith("data:")
      || url.startsWith("http:")
      || url.startsWith("https:")) {
      if (/\.(webm|mp4|mov)$/.test(url)) {
        obj = PIXI.Texture.fromVideoUrl(url);
      } else {
        obj = PIXI.Texture.fromImage(url);
      }

    } else {
      if (/\.(webm|mp4|mov)$/.test(url)) {
        obj = PIXI.Texture.fromVideoUrl(`${HOST}${url}`);
      } else {
        let _url;

        if (url) {
          _url = (isSafari || !TRYWEBP) ? `${HOST}${url}` : changeExtension(`${HOST}${url}`, "webp");
        } else {
          _url = "";
        }
        obj = PIXI.Texture.fromImage(_url);
      }
    }
    TEXTURES[url] = obj;
  }

  return new PIXI.Texture(obj.baseTexture);
}

export function getAudio(url: string) {
  const obj = AUDIOS[url];

  if (obj) {
    return obj;
  }
  const audio = new Audio();

  audio.src = `${HOST}${url}`;
  audio.preload = "auto";
  audio.load();

  return audio;

}
