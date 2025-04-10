const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: path.resolve(__dirname, 'src/main.ts'),
  output: {
    path: path.resolve(__dirname, '../../dist/apps/backend'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    alias: {
      '@nestjs/common': path.resolve(__dirname, 'node_modules/@nestjs/common'),
      '@nestjs/core': path.resolve(__dirname, 'node_modules/@nestjs/core'),
      '@nestjs/config': path.resolve(__dirname, 'node_modules/@nestjs/config'),
    },
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.app.json'),
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: false,
  },
};
