export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
  categoryId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
