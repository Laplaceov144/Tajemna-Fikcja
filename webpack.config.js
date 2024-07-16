const path = require('path');

module.exports = {
  entry: './src/index.js', 
  output: {
    path: path.resolve(__dirname, 'build'),
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
  devServer: {
    static: {
        directory: path.join(__dirname, '/'),
      },
    historyApiFallback: true
  },
  mode: 'development'
}
