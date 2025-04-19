export interface AIModel {
  id: string;
  name: string;
  type: "categorization" | "merchant" | "receipt" | "analytics";
  version: string;
  status: "active" | "inactive" | "training";
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
