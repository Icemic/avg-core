/**
 * @file        Util to combine props between
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

export default function combineProps(props, filter) {
  const validKeys = Object.keys(filter);
  const keys = Object.keys(props);
  const newProps = {};

  for (const key of keys) {
    if (validKeys.includes(key) && key !== 'children') {
      newProps[key] = props[key];
    }
  }

  return newProps;
}
