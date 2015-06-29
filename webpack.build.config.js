'use strict'

var ExtractTextPlugin = require('extract-text-webpack-plugin')
var webpack = require('webpack')

var pkg = require('./package.json')

module.exports = {
  entry: {
    app: './src/app',
    vendor: [
      'codemirror',
      'codemirror/addon/display/placeholder',
      'codemirror/addon/mode/overlay',
      'codemirror/mode/xml/xml',
      'codemirror/mode/markdown/markdown',
      'codemirror/mode/gfm/gfm',
      'react',
      'react/lib/update',
      'redux',
    ]
  },
  node: {
    buffer: false,
    global: false,
    process: false
  },
  output: {
    path: 'public',
    filename: 'app.js'
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'VERSION': JSON.stringify(pkg.version)
    }),
    new ExtractTextPlugin('style.css'),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'deps.js'),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ],
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel', exclude: /node_modules/},
      {test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css?-restructuring!autoprefixer')}
    ]
  }
}
