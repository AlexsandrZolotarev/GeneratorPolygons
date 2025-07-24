const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'test-task.min.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/GeneratorPolygons/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', 
      inject: 'body'
    })
  ]
};
