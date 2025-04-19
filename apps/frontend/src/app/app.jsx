Object.defineProperty(exports, "__esModule", { value: true });
exports.App = App;
const antd_1 = require("antd");
const react_router_1 = require("@tanstack/react-router");
const router_1 = require("../core/router");
const { Header, Content, Footer } = antd_1.Layout;
function App() {
  return (
    <antd_1.Layout className="min-h-screen">
      <Header className="flex items-center justify-between px-6">
        <h1 className="text-white text-xl">Fresh Expense</h1>
      </Header>
      <Content className="p-6">
        <react_router_1.RouterProvider router={router_1.router} />
      </Content>
      <Footer className="text-center">Fresh Expense ©{new Date().getFullYear()}</Footer>
    </antd_1.Layout>
  );
}
exports.default = App;
//# sourceMappingURL=app.js.map
