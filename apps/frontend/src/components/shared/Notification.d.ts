import { ReactNode } from 'react';
interface NotificationContextType {
    showNotification: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}
export declare function useNotification(): NotificationContextType;
interface NotificationProviderProps {
    children: ReactNode;
}
export declare function NotificationProvider({ children }: NotificationProviderProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=Notification.d.ts.map