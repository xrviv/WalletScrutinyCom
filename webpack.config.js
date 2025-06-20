const webpack = require("webpack");
const TerserPlugin = require('terser-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  devtool: 'source-map',
  entry: {
    jquery: [
      './assets/js/_main.js',
      './assets/js/plugins/jquery.fitvids.js',
      './assets/js/plugins/jquery.greedy-navigation.js'
    ],
    dom_sanitization: ['dompurify'],
    verifications_data: {
      import: [
        './src/verifications_utils.mjs',
      ],
      dependOn: ['dom_sanitization'],
    },
    verifications_ui: {
      import: [
        './src/drag-and-drop-utils.js',
        './src/blossom.js',
        './src/blossom-utils.js',
        './src/drag-and-drop.js',
        './src/assets-table-utils.js',
        './src/assets-table.js',
        './src/preview-button.js'
      ],
      dependOn: ['dom_sanitization'],
    },
    font_awesome: [
      './src/font-awesome.js'
    ]
  },
  output: {
    filename: '[name].bundle.min.js',
  },
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      fs: false, // 'fs' is not supported in browsers, disable it
      zlib: require.resolve('browserify-zlib'),
      util: require.resolve('util/'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      process: require.resolve('process/browser'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
    usedExports: true
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery',
      process: 'process/browser',
    }),
    new WebpackShellPluginNext({
      onBuildStart: {
        scripts: [
          'printf "last_commit_ref: %s\\n" "$(git rev-parse HEAD)" > ./_data/git.yml',
          'printf "uncommited: %s\\n" "$(git status -s -b | tr \'\\n\' \'*\' | tr \'##\' \' \')" >> ./_data/git.yml'
        ],
        blocking: true
      }
    }),
    // new BundleAnalyzerPlugin()
  ]
};
