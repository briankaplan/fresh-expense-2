const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
const __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
const __importStar =
  (this && this.__importStar) ||
  (() => {
    let ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          const ar = [];
          for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) return mod;
      const result = {};
      if (mod != null)
        for (let k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types='vitest' />
const path_1 = require("node:path");
const nx_tsconfig_paths_plugin_1 = require("@nx/vite/plugins/nx-tsconfig-paths.plugin");
const vite_1 = require("vite");
const vite_plugin_dts_1 = __importDefault(require("vite-plugin-dts"));
exports.default = (0, vite_1.defineConfig)(async () => {
  const { viteStaticCopy } = await Promise.resolve().then(() =>
    __importStar(require("vite-plugin-static-copy")),
  );
  return {
    root: __dirname,
    cacheDir: "../../node_modules/.vite/packages/utils",
    plugins: [
      (0, nx_tsconfig_paths_plugin_1.nxViteTsPaths)(),
      viteStaticCopy({
        targets: [
          {
            src: "*.md",
            dest: "../../dist/packages/utils",
          },
        ],
      }),
      (0, vite_plugin_dts_1.default)({
        entryRoot: "src",
        tsconfigPath: (0, path_1.resolve)(__dirname, "tsconfig.lib.json"),
      }),
    ],
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    // Configuration for building your library.
    // See: https://vitejs.dev/guide/build.html#library-mode
    build: {
      outDir: "../../dist/packages/utils",
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        entry: (0, path_1.resolve)(__dirname, "src/index.ts"),
        name: "utils",
        fileName: "index",
        formats: ["es", "cjs"],
      },
      rollupOptions: {
        external: [
          "sharp",
          "pdf-img-convert",
          "@aws-sdk/client-s3",
          "@aws-sdk/s3-request-presigner",
        ],
        output: {
          globals: {
            sharp: "sharp",
            "pdf-img-convert": "pdfImgConvert",
          },
        },
      },
      sourcemap: true,
      minify: "esbuild",
    },
    test: {
      watch: false,
      globals: true,
      environment: "node",
      include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      reporters: ["default"],
      coverage: {
        reportsDirectory: "../../coverage/packages/utils",
        provider: "v8",
      },
    },
    resolve: {
      alias: {
        "@": (0, path_1.resolve)(__dirname, "src"),
      },
    },
  };
});
//# sourceMappingURL=vite.config.js.map
