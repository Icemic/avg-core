/**
 * @file        logger
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

export default class Logger {
  public name: string;
  public isProduction: boolean;
  constructor(name: string) {
    this.name = name;
    this.isProduction = process && process.env && process.env.NODE_ENV === "production";
  }
  public static create(name: string) {
    return new Logger(name);
  }

  /* tslint:disable */
  public fatal(...args: any[]) {
    console.error(`[${this.name}]`, ...args);
  }
  public error(...args: any[]) {
    console.error(`[${this.name}]`, ...args);
  }
  public warn(...args: any[]) {
    console.warn(`[${this.name}]`, ...args);
  }
  public info(...args: any[]) {
    console.log(`[${this.name}]`, ...args);
  }
  public debug(...args: any[]) {
    if (!this.isProduction) {
      console.debug(`[${this.name}]`, ...args);
    }
  }
  public trace(...args: any[]) {
    if (!this.isProduction) {
      console.trace(`[${this.name}]`, ...args);
    }
  }
  /* tslint:enable */
}
