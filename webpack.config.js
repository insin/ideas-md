'use strict'

var path = require('path')
var webpack = require('webpack')

var pkg = require('./package.json')

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/app'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'VERSION': JSON.stringify(pkg.version)
    })
  ],
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'react-hot!babel', include: path.join(__dirname, 'src')},
      {test: /\.css$/, loader: 'style!css?-restructuring!autoprefixer'},
      {test: /\.(otf|eot|svg|ttf|woff|woff2).*$/, loader: 'url?limit=8192'}
    ]
  }
}
