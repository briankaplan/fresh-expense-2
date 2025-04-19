import type { Company, Transaction, User } from "@fresh-expense/types";
export declare const createMockUser: (overrides?: Partial<User>) => User;
export declare const createMockTransaction: (overrides?: Partial<Transaction>) => Transaction;
export declare const createMockCompany: (overrides?: Partial<Company>) => Company;
export declare const waitForAsync: (ms?: number) => Promise<void>;
export declare const mockFetch: (response: any) => jest.Mock<any, any, any>;
export declare const mockLocalStorage: () => {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};
export declare const toMatchTransaction: (
  received: Transaction,
  expected: Transaction,
) => {
  pass: boolean;
  message: () => string;
};
export declare const mockApiResponses: {
  auth: {
    login: {
      success: {
        token: string;
        user: User;
      };
      error: {
        message: string;
      };
    };
    register: {
      success: {
        message: string;
      };
      error: {
        message: string;
      };
    };
  };
  transactions: {
    list: {
      success: {
        data: Transaction[];
        total: number;
      };
      error: {
        message: string;
      };
    };
  };
};
export declare const setupTestEnvironment: () => void;
//# sourceMappingURL=index.d.ts.map
