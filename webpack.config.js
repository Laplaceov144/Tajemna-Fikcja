const path = require('path');
const webpack = require('webpack');

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
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  
  devServer: {
    static: {
        directory: path.join(__dirname, '/'),
      },
    historyApiFallback: true
  }
}