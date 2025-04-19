export interface OCR {
  id: string;
  text: string;
  confidence: number;
  metadata: {
    language?: string;
    orientation?: number;
    textAngle?: number;
    width?: number;
    height?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OCRResult {
  text: string;
  confidence: number;
  structuredData: {
    merchantName: string;
    date: string | Date;
    total: number;
    subtotal?: number;
    tax?: number;
    items: Array<{
      name: string;
      price: number;
      quantity?: number;
    }>;
    subscriptionInfo?: {
      isSubscription: boolean;
      nextBillingDate?: string | Date;
      billingPeriod?: string;
      amount?: number;
    };
  };
} 