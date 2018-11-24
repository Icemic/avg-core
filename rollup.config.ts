import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import license from 'rollup-plugin-license';

const pkg = require('./package.json');

const licenseText = `/*!
 * @file        Onetale Core (AVG.js) library
 * @author      Icemic Jia <bingfeng.web@gmail.com>
 * @copyright   2015-present Icemic Jia
 * @version     <%= pkg.version %>
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
`;

const outputCommon = {
  sourcemap: true,
  globals: {
    'pixi.js': 'PIXI'
  }
};

export default {
  input: `src/avg.ts`,
  output: [
    { file: pkg.main, name: 'AVG', format: 'umd', ...outputCommon },
    { file: pkg.module, format: 'es', ...outputCommon },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['pixi.js'],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    replace({
      exclude: 'node_modules/mobx/**',
      AVGVERSION: JSON.stringify(pkg.version),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
      namedExports: {
        'node_modules/react/react.js': [
          'createElement',
          'Component',
          'Children',
          'PureComponent'
        ],
        'node_modules/react-dom/index.js': [
          'render',
          'findDOMNode',
          'unstable_batchedUpdates'
        ],
        'node_modules/mobx-react/custom.js': ['observer']
      }
    }),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    license({
      sourceMap: true,
      banner: licenseText
    }),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
};
