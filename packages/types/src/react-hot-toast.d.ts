declare module "react-hot-toast" {
  import type { ReactNode } from "react";

  export interface ToastOptions {
    id?: string;
    icon?: ReactNode;
    duration?: number;
    position?:
      | "top-left"
      | "top-center"
      | "top-right"
      | "bottom-left"
      | "bottom-center"
      | "bottom-right";
    style?: React.CSSProperties;
    className?: string;
    iconTheme?: {
      primary: string;
      secondary: string;
    };
    ariaProps?: {
      role: string;
      "aria-live": "polite" | "assertive" | "off";
    };
  }

  export interface Toast {
    id: string;
    message: ReactNode;
    type: "success" | "error" | "loading" | "blank" | "custom";
    duration?: number;
    pauseDuration: number;
    position: ToastOptions["position"];
    createdAt: number;
    visible: boolean;
    height?: number;
    icon?: ReactNode;
    style?: React.CSSProperties;
    className?: string;
    iconTheme?: ToastOptions["iconTheme"];
    ariaProps?: ToastOptions["ariaProps"];
  }

  export interface ToasterProps {
    position?: ToastOptions["position"];
    toastOptions?: ToastOptions;
    reverseOrder?: boolean;
    gutter?: number;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
  }

  export const Toaster: React.FC<ToasterProps>;
  export const toast: {
    (message: ReactNode, options?: ToastOptions): string;
    success: (message: ReactNode, options?: ToastOptions) => string;
    error: (message: ReactNode, options?: ToastOptions) => string;
    loading: (message: ReactNode, options?: ToastOptions) => string;
    custom: (message: ReactNode, options?: ToastOptions) => string;
    dismiss: (toastId?: string) => void;
    remove: (toastId?: string) => void;
    promise: <T>(
      promise: Promise<T>,
      msgs: {
        loading: ReactNode;
        success: ReactNode | ((data: T) => ReactNode);
        error: ReactNode | ((error: Error) => ReactNode);
      },
      opts?: ToastOptions,
    ) => Promise<T>;
  };
}
