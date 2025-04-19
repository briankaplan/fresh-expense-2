const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionList = void 0;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const TransactionList = ({ transactions }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return (
    <material_1.Paper elevation={2}>
      <material_1.List>
        {transactions.map((transaction) => (
          <material_1.ListItem key={transaction.id} divider>
            <material_1.ListItemText
              primary={transaction.description}
              secondary={
                <material_1.Box component="span" sx={{ display: "flex", gap: 1 }}>
                  <material_1.Typography component="span" variant="body2" color="text.secondary">
                    {formatDate(transaction.date)}
                  </material_1.Typography>
                  {transaction.category && (
                    <material_1.Typography component="span" variant="body2" color="text.secondary">
                      • {transaction.category}
                    </material_1.Typography>
                  )}
                </material_1.Box>
              }
            />
            <material_1.ListItemSecondaryAction>
              <material_1.Typography
                variant="body2"
                color={transaction.amount < 0 ? "error" : "success.main"}
              >
                {formatCurrency(transaction.amount)}
              </material_1.Typography>
            </material_1.ListItemSecondaryAction>
          </material_1.ListItem>
        ))}
      </material_1.List>
    </material_1.Paper>
  );
};
exports.TransactionList = TransactionList;
//# sourceMappingURL=TransactionList.js.map
