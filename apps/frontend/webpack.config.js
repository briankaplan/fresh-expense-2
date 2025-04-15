const path = require('path');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), config => {
  // Update the webpack config as needed here.
  config.plugins = [
    ...(config.plugins || []),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
      inject: true,
    }),
  ];

  config.resolve = {
    ...config.resolve,
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  };

  config.devServer = {
    ...config.devServer,
    port: 4200,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'src/assets'),
    },
    proxy: {
      '/api': 'http://localhost:3000',
    },
  };

  return config;
});
