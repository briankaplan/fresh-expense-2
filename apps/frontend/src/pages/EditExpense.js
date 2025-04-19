"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const material_1 = require("@mui/material");
const ExpenseForm_1 = __importDefault(require("@/shared/components/ExpenseForm"));
const EditExpense = () => {
    const { id } = (0, react_router_dom_1.useParams)();
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h4" gutterBottom>
        Edit Expense
      </material_1.Typography>
      <material_1.Paper sx={{ p: 2 }}>
        <ExpenseForm_1.default expenseId={id}/>
      </material_1.Paper>
    </material_1.Box>);
};
exports.default = EditExpense;
//# sourceMappingURL=EditExpense.js.map