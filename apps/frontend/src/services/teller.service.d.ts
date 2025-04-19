import { TellerAccount, TellerTransaction } from '@fresh-expense/types';
export interface TellerWebhookEvent {
    type: string;
    data: {
        accountId: string;
        transactionId: string;
    };
}
declare const tellerService: {
    getAccounts(): Promise<TellerAccount[]>;
    getAccount(accountId: string): Promise<TellerAccount>;
    syncTransactions(accountId: string): Promise<void>;
    getTransactions(accountId: string, startDate?: string, endDate?: string): Promise<TellerTransaction[]>;
    handleWebhook(event: TellerWebhookEvent): Promise<void>;
    disconnectAccount(accountId: string): Promise<void>;
};
export default tellerService;
//# sourceMappingURL=teller.service.d.ts.map