Object.defineProperty(exports, "__esModule", { value: true });
exports.WithClickHandler = exports.Empty = exports.Loading = exports.Default = void 0;
const TransactionList_1 = require("./TransactionList");
const meta = {
  title: "Features/Expenses/TransactionList",
  component: TransactionList_1.TransactionList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};
exports.default = meta;
const sampleTransactions = [
  {
    id: "1",
    date: new Date("2024-03-15"),
    description: "Grocery shopping",
    amount: { value: 150.75, currency: "USD" },
    category: "Groceries",
    merchant: { name: "Whole Foods" },
  },
  {
    id: "2",
    date: new Date("2024-03-14"),
    description: "Dinner with friends",
    amount: { value: 85.5, currency: "USD" },
    category: "Dining",
    merchant: { name: "Italian Restaurant" },
  },
  {
    id: "3",
    date: new Date("2024-03-13"),
    description: "Gas station",
    amount: { value: 45.0, currency: "USD" },
    category: "Transportation",
    merchant: { name: "Shell" },
  },
];
exports.Default = {
  args: {
    transactions: sampleTransactions,
  },
};
exports.Loading = {
  args: {
    transactions: sampleTransactions,
    loading: true,
  },
};
exports.Empty = {
  args: {
    transactions: [],
  },
};
exports.WithClickHandler = {
  args: {
    transactions: sampleTransactions,
    onTransactionClick: (transaction) => {
      console.log("Clicked transaction:", transaction);
    },
  },
};
//# sourceMappingURL=TransactionList.stories.js.map
