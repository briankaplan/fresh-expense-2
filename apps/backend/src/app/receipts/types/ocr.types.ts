export interface OCRResult {
  text: string;
  confidence: number;
  structuredData: {
    merchantName: string;
    date: string;
    total: number;
    subtotal?: number;
    tax?: number;
    items: Array<{
      item: string;
      price: number;
    }>;
    subscriptionInfo?: {
      isSubscription: boolean;
      frequency?: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
      nextBillingDate?: string;
      planName?: string;
      recurringAmount?: number;
    };
  };
}

export interface OCRProcessingResult {
  success: boolean;
  result?: OCRResult;
  error?: string;
}
