/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { resolve } from 'path';

export default defineConfig(async () => {
  const tsconfigPaths = (await import('vite-tsconfig-paths')).default;

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/frontend',

    define: {
      'process.env': process.env
    },

    server: {
      port: 3001,
      strictPort: true,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      }
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },

    plugins: [react(), tsconfigPaths(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      sourcemap: true,
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@fresh-expense/hooks': resolve(__dirname, './src/hooks')
      },
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
  };
});
