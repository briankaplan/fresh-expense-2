const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const client_1 = require("react-dom/client");
const react_query_1 = require("@tanstack/react-query");
const antd_1 = require("antd");
const react_error_boundary_1 = require("react-error-boundary");
const App_1 = __importDefault(require("./app/App"));
require("./styles/index.scss");
const queryClient = new react_query_1.QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});
const container = document.getElementById("root");
const root = (0, client_1.createRoot)(container);
root.render(
  <react_1.StrictMode>
    <react_error_boundary_1.ErrorBoundary fallback={<div>Something went wrong</div>}>
      <react_query_1.QueryClientProvider client={queryClient}>
        <antd_1.ConfigProvider
          theme={{
            token: {
              colorPrimary: "#1677ff",
            },
          }}
        >
          <App_1.default />
        </antd_1.ConfigProvider>
      </react_query_1.QueryClientProvider>
    </react_error_boundary_1.ErrorBoundary>
  </react_1.StrictMode>,
);
//# sourceMappingURL=main.js.map
