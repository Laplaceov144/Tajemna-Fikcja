const path = require('path');
const webpack = require('webpack');
//const { CleanWebpackPlugin } = require('clean-webpack-plugin');
//const HtmlWebpackPlugin = require('html-webpack-plugin');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const isProduction = mode === 'production';

module.exports = {
  mode,
  entry: './src/index.js', 
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js' 
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  // plugins: [
  //   new webpack.DefinePlugin({
  //     'process.env.NODE_ENV': JSON.stringify(mode)
  //   }),
  //   new HtmlWebpackPlugin({
  //     template: 'index.html',
  //   })
  // ].concat(isProduction ? [new CleanWebpackPlugin()] : []),
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  
  devServer: {
    //contentBase: './dist',
    //hot: true,
    static: {
        directory: path.join(__dirname, '/'),
      },
    historyApiFallback: true
  }
}