export interface Analytics {
  id: string;
  userId: string;
  type: "spending" | "income" | "category" | "merchant" | "trend";
  data: Record<string, any>;
  period: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
