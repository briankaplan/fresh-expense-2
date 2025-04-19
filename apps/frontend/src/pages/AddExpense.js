const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const ExpenseForm_1 = __importDefault(require("@/shared/components/ExpenseForm"));
const AddExpense = () => {
  return (
    <material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h4" gutterBottom>
        Add New Expense
      </material_1.Typography>
      <material_1.Paper sx={{ p: 2 }}>
        <ExpenseForm_1.default />
      </material_1.Paper>
    </material_1.Box>
  );
};
exports.default = AddExpense;
//# sourceMappingURL=AddExpense.js.map
