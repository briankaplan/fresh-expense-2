import type { ICompany } from "@fresh-expense/types";

export const createMockCompany = (overrides?: Partial<ICompany>): ICompany => ({
  id: "company-123",
  userId: "user-123",
  name: "Test Company",
  description: "A test company for unit testing",
  industry: "Technology",
  location: {
    address: "123 Test St",
    city: "Test City",
    state: "TS",
    country: "US",
    postalCode: "12345",
    coordinates: [0, 0],
  },
  contact: {
    phone: "123-456-7890",
    email: "test@company.com",
    website: "https://test.company.com",
  },
  settings: {
    currency: "USD",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    fiscalYearStart: new Date(new Date().getFullYear(), 0, 1),
    fiscalYearEnd: new Date(new Date().getFullYear(), 11, 31),
  },
  status: "active",
  integrations: {
    teller: {
      enabled: true,
      lastSync: new Date(),
      syncStatus: "success",
    },
    email: {
      enabled: true,
      lastSync: new Date(),
      syncStatus: "success",
    },
    storage: {
      enabled: true,
      lastSync: new Date(),
      syncStatus: "success",
    },
  },
  metadata: {
    createdBy: "user-123",
    updatedBy: "user-123",
    lastSyncedAt: new Date(),
    version: "1.0",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
}); 