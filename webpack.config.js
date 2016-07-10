var webpack = require('webpack');
var path = require('path');

module.exports = {
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  entry: {
    'ghost-urn': './src/lib/ghost-urn.ts',
  },
  output: {
    path: path.join(__dirname, 'web'),
    filename: '[name].js',
    publicPath: '/dist',
    library: 'ghostUrn',
    libraryTarget: 'var',
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
//    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],
  resolve: {
    extensions: ["", ".ts", ".tsx", ".js"],
    alias: {
    },
  },
};
