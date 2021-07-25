const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'production',
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js'
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "./src/index.html", to: "index.html" },
      { from: './src/list-item.html', to: 'list-item.html' },
      { from: './src/product.html', to: 'product.html' }
    ])
    
  ],
  devtool: 'source-map',
  // module: {
  //   rules: [
  //     { test: /\.s?css$/, use: [ 'style-loader', 'css-loader', 'sass-loader' ] },
  //     {
  //       test: /\.js$/,
  //       exclude: /(node_modules|bower_components)/,
  //       loader: 'babel-loader',
  //       query: {
  //         presets: ['env'],
  //         plugins: ['transform-react-jsx', 'transform-object-rest-spread', 'transform-runtime']
  //       }
  //     }
  //   ]
  // }
  // devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
};
