const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
  return {
    ...config,
    target: 'node',
    mode: 'production',
    entry: path.resolve(__dirname, 'src/main.ts'),
    output: {
      path: path.resolve(__dirname, '../../dist/apps/backend'),
      filename: 'main.js',
      module: true,
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['node_modules', path.resolve(__dirname, 'src')],
      alias: {
        '@nestjs/common': path.resolve(__dirname, 'node_modules/@nestjs/common'),
        '@nestjs/core': path.resolve(__dirname, 'node_modules/@nestjs/core'),
        '@nestjs/config': path.resolve(__dirname, 'node_modules/@nestjs/config'),
        '@schemas': path.resolve(__dirname, 'src/schemas'),
        '@modules': path.resolve(__dirname, 'src/modules'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@app': path.resolve(__dirname, 'src/app'),
        '@auth': path.resolve(__dirname, 'src/auth'),
        '@controllers': path.resolve(__dirname, 'src/controllers'),
        '@middleware': path.resolve(__dirname, 'src/middleware'),
        '@types': path.resolve(__dirname, 'src/types')
      },
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false,
        crypto: false,
      },
    },
    externals: [nodeExternals()],
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
            options: {
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
});
