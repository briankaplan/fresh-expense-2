export interface Integration {
  id: string;
  name: string;
  type: 'bank' | 'payment' | 'analytics' | 'notification';
  status: 'active' | 'inactive' | 'error';
  credentials: Record<string, any>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 