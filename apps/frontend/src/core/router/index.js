Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const react_router_1 = require("@tanstack/react-router");
const app_1 = require("@/app/app");
const rootRoute = (0, react_router_1.createRootRoute)({
  component: app_1.App,
});
// Create the router instance
exports.router = (0, react_router_1.createRouter)({
  routeTree: rootRoute,
  context: {
    auth: undefined,
  },
});
//# sourceMappingURL=index.js.map
