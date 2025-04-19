const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = __importDefault(require("./routes"));
exports.default = {
  async fetch(request, env, ctx) {
    return routes_1.default.handle(request, env, ctx);
  },
};
//# sourceMappingURL=index.js.map
