import { ExpenseCategory } from "../lib/types";

export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  "Food & Dining": "restaurant",
  Shopping: "shopping_cart",
  Transportation: "directions_car",
  Entertainment: "movie",
  Utilities: "home",
  Healthcare: "local_hospital",
  Education: "school",
  Travel: "flight",
  "Personal Care": "spa",
  "Home & Garden": "home",
  Insurance: "security",
  Investments: "trending_up",
  "Gifts & Donations": "card_giftcard",
  Business: "business",
  Other: "category",
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  "Food & Dining": "#FF6B6B",
  Shopping: "#4ECDC4",
  Transportation: "#45B7D1",
  Entertainment: "#96CEB4",
  Utilities: "#FFEEAD",
  Healthcare: "#D4A5A5",
  Education: "#9B59B6",
  Travel: "#3498DB",
  "Personal Care": "#E67E22",
  "Home & Garden": "#2ECC71",
  Insurance: "#E74C3C",
  Investments: "#F1C40F",
  "Gifts & Donations": "#1ABC9C",
  Business: "#34495E",
  Other: "#95A5A6",
};
