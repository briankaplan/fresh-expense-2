const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const react_router_dom_1 = require("react-router-dom");
const app_1 = __importDefault(require("./app"));
describe("App", () => {
  it("should render successfully", () => {
    const { baseElement } = (0, react_1.render)(
      <react_router_dom_1.BrowserRouter>
        <app_1.default />
      </react_router_dom_1.BrowserRouter>,
    );
    expect(baseElement).toBeTruthy();
  });
  it("should have a greeting as the title", () => {
    const { getByText } = (0, react_1.render)(
      <react_router_dom_1.BrowserRouter>
        <app_1.default />
      </react_router_dom_1.BrowserRouter>,
    );
    expect(getByText(/Welcome frontend/gi)).toBeTruthy();
  });
});
//# sourceMappingURL=app.spec.js.map
