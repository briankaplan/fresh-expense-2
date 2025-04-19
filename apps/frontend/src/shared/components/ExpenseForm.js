var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
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
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const react_router_dom_1 = require("react-router-dom");
const categories = [
  "Food & Dining",
  "Groceries",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Travel",
  "Other",
];
const ExpenseForm = ({ expenseId }) => {
  const navigate = (0, react_router_dom_1.useNavigate)();
  const [formData, setFormData] = (0, react_1.useState)({
    date: new Date(),
    description: "",
    amount: "",
    category: "",
    notes: "",
  });
  (0, react_1.useEffect)(() => {
    if (expenseId) {
      // TODO: Fetch expense data if editing
      console.log("Fetching expense:", expenseId);
    }
  }, [expenseId]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, date }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (expenseId) {
        // TODO: Update existing expense
        console.log("Updating expense:", expenseId, formData);
      } else {
        // TODO: Create new expense
        console.log("Creating expense:", formData);
      }
      navigate("/expenses");
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <material_1.Grid container spacing={3}>
        <material_1.Grid item xs={12} sm={6}>
          <DatePicker_1.DatePicker
            label="Date"
            value={formData.date}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
              },
            }}
          />
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6}>
          <material_1.TextField
            name="amount"
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{
              step: "0.01",
              min: "0",
            }}
          />
        </material_1.Grid>
        <material_1.Grid item xs={12}>
          <material_1.TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            required
          />
        </material_1.Grid>
        <material_1.Grid item xs={12}>
          <material_1.FormControl fullWidth required>
            <material_1.InputLabel id="category-label">Category</material_1.InputLabel>
            <material_1.Select
              labelId="category-label"
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
            >
              {categories.map((category) => (
                <material_1.MenuItem key={category} value={category}>
                  {category}
                </material_1.MenuItem>
              ))}
            </material_1.Select>
          </material_1.FormControl>
        </material_1.Grid>
        <material_1.Grid item xs={12}>
          <material_1.TextField
            name="notes"
            label="Notes"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />
        </material_1.Grid>
        <material_1.Grid item xs={12}>
          <material_1.Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <material_1.Button type="button" onClick={() => navigate("/expenses")}>
              Cancel
            </material_1.Button>
            <material_1.Button type="submit" variant="contained" color="primary">
              {expenseId ? "Update" : "Create"} Expense
            </material_1.Button>
          </material_1.Box>
        </material_1.Grid>
      </material_1.Grid>
    </form>
  );
};
exports.default = ExpenseForm;
//# sourceMappingURL=ExpenseForm.js.map
