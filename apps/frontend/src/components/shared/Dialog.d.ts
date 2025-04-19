import { ReactNode } from 'react';
interface DialogAction {
    label: string;
    onClick: () => Promise<void> | void;
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'primary' | 'secondary' | 'error' | 'success' | 'info' | 'warning';
    disabled?: boolean;
}
interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    actions?: DialogAction[];
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    loading?: boolean;
    showCloseButton?: boolean;
    dividers?: boolean;
}
export declare function Dialog({ open, onClose, title, children, actions, maxWidth, fullWidth, loading, showCloseButton, dividers, }: DialogProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=Dialog.d.ts.map