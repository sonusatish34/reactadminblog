// turbopack.config.js
const { TurbopackPlugin } = require('turbopack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js',
  },
  plugins: [
    new TurbopackPlugin(),
  ],
};
