var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
require("./DashboardLayout.css");
const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">{/* Sidebar content */}</aside>
      <main className="dashboard-main">
        <header className="dashboard-header">{/* Header content */}</header>
        <div className="dashboard-content">{children}</div>
        <footer className="dashboard-footer">{/* Footer content */}</footer>
      </main>
    </div>
  );
};
exports.default = DashboardLayout;
//# sourceMappingURL=DashboardLayout.js.map
