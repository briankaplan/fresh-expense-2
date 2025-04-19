const path = require('path');

const { composePlugins, withNx } = require('@nx/webpack');
const nodeExternals = require('webpack-node-externals');

/**
 * This is a carefully tuned webpack configuration for NestJS running in Nx
 * Fixes the "Cannot read properties of undefined (reading 'target')" error
 */
module.exports = composePlugins(
  withNx({
    target: 'node',
    compiler: 'tsc',
  }),
  (config) => {
    // Update the webpack config as needed here.
    // e.g. config.plugins.push(new MyPlugin())

    // Add support for native node modules
    config.externals = [
      ...config.externals || [],
      /^node:/,  // Handle node built-in modules
    ];
    
    // Additional webpack configuration for Node.js
    return {
      ...config,
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      entry: path.resolve(__dirname, 'src/main.ts'),
      experiments: {
        outputModule: true,
      },
      output: {
        path: path.resolve(__dirname, '../../dist/apps/backend'),
        filename: 'main.js',
        module: true,
        chunkFormat: 'module',
        globalObject: 'this',
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
          '@types': path.resolve(__dirname, 'src/types'),
        },
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          path: false,
          crypto: false,
        },
      },
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.ts$/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  configFile: path.resolve(__dirname, 'tsconfig.app.json'),
                },
              },
            ],
          },
        ],
      },
      devtool: 'source-map',
    };
  }
);
