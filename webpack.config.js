const webpack = require('webpack');
const WebpackHTMLPlugin = require('webpack-html-plugin');
const BabiliPlugin = require('babili-webpack-plugin');
const path = require('path');
const env = require('./env');

const { compact } = require('lodash');

const buildPath = env.isProd ? '' : '/';

const hot = p => (env.isHot ? p : null);
const prod = p => (env.isProd ? p : null);

const config = {
  bail: env.isProd || env.isTest,

  devServer: env.isDev ? {
    inline: true,
    contentBase: buildPath,
    compress: true,
    hot: env.isHot,
    hotOnly: false,
  } : undefined,

  performance: env.isDev ? false : undefined,

  entry: {
    bundle: compact([
      hot('react-hot-loader/patch'),
      hot('webpack-hot-middleware/client'),
      path.resolve(__dirname, './src/client/index.tsx'),
    ]),
  },

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: env.isProd ? '[name]_[chunkhash].js' : '[name]_[hash].js',
    publicPath: buildPath,
  },

  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.jsx'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: compact([
          hot('react-hot-loader/webpack'),
          {
            loader: 'ts-loader',
            query: {
              transpileOnly: true,
            },
          },
        ]),
      },
      {
        test: /\.html$/,
        use: 'html',
      },
    ],
  },

  plugins: compact([
    hot(new webpack.HotModuleReplacementPlugin()),
    new webpack.DefinePlugin({
      __DEBUG__: JSON.stringify(env.isDev),
      'process.env.ENVIRONMENT': JSON.stringify('BROWSER'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      isBrowser: true,
      isHot: JSON.stringify(env.isHot),
    }),
    new WebpackHTMLPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'src/client/index.html'),
      inject: 'body',
      minify: env.isProduction ? {
        html5: true,
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
      } : false,
    }),
    prod(new webpack.optimize.OccurrenceOrderPlugin(true)),
    prod(new BabiliPlugin()),
  ]),
};

module.exports = config;
