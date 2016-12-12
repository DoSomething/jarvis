const path = require('path');

module.exports = {
  entry: './interface/js/index.jsx',
  output: {
    filename: 'bundle.js',
    path:  './interface/dist/',
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
      },
    ]
  },
}
