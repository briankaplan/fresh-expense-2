export interface Report {
  id: string;
  name: string;
  type: "spending" | "income" | "category" | "merchant" | "custom";
  filters: {
    startDate?: Date;
    endDate?: Date;
    categories?: string[];
    merchants?: string[];
    minAmount?: number;
    maxAmount?: number;
  };
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
