export interface Merchant {
  id: string;
  name: string;
  category?: string;
  description?: string;
  website?: string;
  logo?: string;
  location?: MerchantLocation;
  contact?: MerchantContact;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantLocation {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface MerchantContact {
  email?: string;
  phone?: string;
  social?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}
