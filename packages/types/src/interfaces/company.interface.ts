export interface ICompany {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  industry?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: [number, number];
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  settings: {
    currency: string;
    timezone: string;
    dateFormat: string;
    fiscalYearStart: Date;
    fiscalYearEnd: Date;
  };
  status: "active" | "inactive" | "archived";
  integrations: {
    teller?: {
      enabled?: boolean;
      lastSync?: Date;
      syncStatus?: string;
    };
    email?: {
      enabled?: boolean;
      lastSync?: Date;
      syncStatus?: string;
    };
    storage?: {
      enabled?: boolean;
      lastSync?: Date;
      syncStatus?: string;
    };
  };
  metadata: {
    createdBy: string;
    updatedBy?: string;
    lastSyncedAt?: Date;
    version: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyOwned {
  companyId: string;
} 