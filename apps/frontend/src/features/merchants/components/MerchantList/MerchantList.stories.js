Object.defineProperty(exports, "__esModule", { value: true });
exports.WithClickHandler = exports.Empty = exports.Loading = exports.Default = void 0;
const MerchantList_1 = require("./MerchantList");
const meta = {
  title: "Features/Merchants/MerchantList",
  component: MerchantList_1.MerchantList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};
exports.default = meta;
const sampleMerchants = [
  {
    id: "1",
    name: "Whole Foods",
    category: "Groceries",
    totalSpent: 1500.75,
    transactionCount: 12,
    lastTransactionDate: "2024-03-15",
  },
  {
    id: "2",
    name: "Italian Restaurant",
    category: "Dining",
    totalSpent: 850.5,
    transactionCount: 8,
    lastTransactionDate: "2024-03-14",
  },
  {
    id: "3",
    name: "Shell",
    category: "Transportation",
    totalSpent: 450.0,
    transactionCount: 15,
    lastTransactionDate: "2024-03-13",
  },
];
exports.Default = {
  args: {
    merchants: sampleMerchants,
  },
};
exports.Loading = {
  args: {
    merchants: sampleMerchants,
    loading: true,
  },
};
exports.Empty = {
  args: {
    merchants: [],
  },
};
exports.WithClickHandler = {
  args: {
    merchants: sampleMerchants,
    onMerchantClick: (merchant) => {
      console.log("Clicked merchant:", merchant);
    },
  },
};
//# sourceMappingURL=MerchantList.stories.js.map
