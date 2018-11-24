const path = require('path');
const webpack = require('webpack');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const TSLintPlugin = require('tslint-webpack-plugin');

const packageInfo = require('./package.json');

const license = `/*!
 * @file        AVG.js library
 * @author      Icemic Jia <bingfeng.web@gmail.com>
 * @copyright   2015-2017 Icemic Jia
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

/* eslint-disable */

module.exports = function (env) {

  let uglifyPlugin;

  env = env || {};

  if (env.minimize) {
    uglifyPlugin = [new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      mangle: true,
      compress: {
        warnings: false
      }
    })];
  } else {
    uglifyPlugin = [];
  }

  return {
    cache: true,
    entry: ['./src/avg.ts'],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `avg${env.minimize ? '.min' : ''}.js`,
      libraryTarget: 'umd',
      library: 'AVG',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      modules: ['src', 'node_modules'],
      plugins: [
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        new ModuleScopePlugin(path.resolve('.', 'src'), [path.resolve('./package.json')]),
      ],
    },
    module: {
      strictExportPresence: true,
      rules: [
        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        // {
        //   test: /\.(ts|tsx)$/,
        //   enforce: 'pre',
        //   loader: require.resolve('tslint-loader'),
        //   options: {
        //     configFile: 'tslint.json'
        //     // emitErrors: true,
        //     // failOnHint: true,
        //   },
        //   include: path.resolve('./src'),
        // },

        // Process JS with Babel.
        {
          test: /\.(ts|tsx)$/,
          // exclude: /node_modules\/(?!(koa-compose|avg-.*|pixi-richtext|huozi))/,
          include: /src\//,
          use: [{
            loader: 'babel-loader',
            query: {
              compact: true,
              cacheDirectory: true
            }
          }, {
            loader: 'ts-loader',
            options: {
            }
          }]
        },
        {
          test: /\.(js|jsx)$/,
          // exclude: /node_modules\/(?!(koa-compose|avg-.*|pixi-richtext|huozi))/,
          include: /src\/|(node_modules\/(koa-compose|avg-.*|pixi-richtext|huozi))/,
          use: [{
            loader: 'babel-loader',
            query: {
              compact: true,
              cacheDirectory: true
            }
          }]
        },
        {
          test: /\.(glsl|frag|vert)$/,
          loader: 'raw-loader',
          exclude: /node_modules/
        },
      ],
    },
    externals: {
      'pixi.js': 'PIXI',
      // 'react': 'React'
    },
    devtool: 'source-map',
    plugins: [
      new TSLintPlugin({
        files: ['./src/**/*.ts', './src/**/*.tsx'],
        format: 'stylish'
      }),
      // Add module names to factory functions so they appear in browser profiler.
      new webpack.NamedModulesPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(packageInfo.version),
        'process.env': {
          NODE_ENV: JSON.stringify(env.release ? 'production' : 'development'),
        },
      }),
      new WatchMissingNodeModulesPlugin('node_modules'),
      ...uglifyPlugin,
      new webpack.BannerPlugin({ banner: license, raw: true }),
    ]
  };
};
