/// <reference types='vitest' />
import { resolve } from 'path';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(async () => {
  const { viteStaticCopy } = await import('vite-plugin-static-copy');

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/utils',

    plugins: [
      nxViteTsPaths(),
      viteStaticCopy({
        targets: [
          {
            src: '*.md',
            dest: '../../dist/packages/utils',
          },
        ],
      }),
      dts({
        entryRoot: 'src',
        tsconfigPath: resolve(__dirname, 'tsconfig.lib.json'),
      }),
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    // Configuration for building your library.
    // See: https://vitejs.dev/guide/build.html#library-mode
    build: {
      outDir: '../../dist/packages/utils',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'utils',
        fileName: 'index',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: [
          'sharp',
          'pdf-img-convert',
          '@aws-sdk/client-s3',
          '@aws-sdk/s3-request-presigner',
        ],
        output: {
          globals: {
            sharp: 'sharp',
            'pdf-img-convert': 'pdfImgConvert',
          },
        },
      },
      sourcemap: true,
      minify: 'esbuild',
    },

    test: {
      watch: false,
      globals: true,
      environment: 'node',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../coverage/packages/utils',
        provider: 'v8',
      },
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  };
});
