/* eslint comma-dangle: ["error",
 {"functions": "never", "arrays": "only-multiline", "objects":
 "only-multiline"} ] */

const webpack = require('webpack');
const pathLib = require('path');

const devBuild = process.env.NODE_ENV !== 'production';

const config = {
  entry: [
    'es5-shim/es5-shim',
    'es5-shim/es5-sham',
    'babel-polyfill',
    './app/bundles/startup/registration',
  ],

  output: {
    filename: 'webpack-bundle.js',
    path: pathLib.resolve(__dirname, '../app/assets/webpack'),
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'assets': pathLib.resolve('./app/assets'),
    }
  },
  plugins: [
    new webpack.EnvironmentPlugin({ NODE_ENV: 'development' }),
  ],
  module: {
    rules: [
      {
        test: require.resolve('react'),
        use: {
          loader: 'imports-loader',
          options: {
            shim: 'es5-shim/es5-shim',
            sham: 'es5-shim/es5-sham',
          }
        },
      },
      {
        test: /\.(jpg|jpeg|png)(\?.*)?$/, // Load only .jpg .jpeg, and .png files
        use: {
          loader: 'file-loader',
          options: {
            name: '[name][md5:hash].[ext]', // Name of bundled asset
            outputPath: '/webpack-assets/', // Output location for assets. Final: `app/assets/webpack/webpack-assets/`
            publicPath: '/assets' // Endpoint asset can be found at on Rails server
          }
        }
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
};

module.exports = config;

if (devBuild) {
  console.log('Webpack dev build for Rails'); // eslint-disable-line no-console
  module.exports.devtool = 'eval-source-map';
} else {
  console.log('Webpack production build for Rails'); // eslint-disable-line no-console
}
