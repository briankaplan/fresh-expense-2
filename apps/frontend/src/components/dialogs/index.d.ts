import { ReactNode } from 'react';
interface DialogAction {
    label: string;
    onClick: () => Promise<void> | void;
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'primary' | 'secondary' | 'error' | 'success' | 'info' | 'warning';
    disabled?: boolean;
}
interface BaseDialogProps {
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
    transition?: 'slide' | 'fade' | 'zoom';
    direction?: 'up' | 'down' | 'left' | 'right';
    fullScreen?: boolean;
}
export declare function Dialog({ open, onClose, title, children, actions, maxWidth, fullWidth, loading, showCloseButton, dividers, transition, direction, fullScreen, }: BaseDialogProps): import("react").JSX.Element;
interface ConfirmationDialogProps extends Omit<BaseDialogProps, 'children' | 'actions'> {
    message: string;
    onConfirm: () => Promise<void> | void;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: DialogAction['color'];
}
export declare function ConfirmationDialog({ message, onConfirm, confirmText, cancelText, confirmColor, onClose, ...props }: ConfirmationDialogProps): import("react").JSX.Element;
interface AlertDialogProps extends Omit<BaseDialogProps, 'children' | 'actions'> {
    message: string;
    severity?: 'success' | 'info' | 'warning' | 'error';
}
export declare function AlertDialog({ message, severity, onClose, ...props }: AlertDialogProps): import("react").JSX.Element;
interface FullScreenDialogProps extends Omit<BaseDialogProps, 'fullScreen'> {
    children: ReactNode;
}
export declare function FullScreenDialog({ onClose, ...props }: FullScreenDialogProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map