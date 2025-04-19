const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const ExpensesTable_1 = __importDefault(require("@/shared/components/ExpensesTable"));
const ExpensesList = () => {
  return (
    <material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h4" gutterBottom>
        Expenses
      </material_1.Typography>
      <material_1.Paper sx={{ p: 2 }}>
        <ExpensesTable_1.default />
      </material_1.Paper>
    </material_1.Box>
  );
};
exports.default = ExpensesList;
//# sourceMappingURL=ExpensesList.js.map
