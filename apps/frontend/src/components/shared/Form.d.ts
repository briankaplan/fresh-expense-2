import type { ReactNode } from "react";
interface FormField {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "password" | "date";
  required?: boolean;
  validation?: (value: string) => string | undefined;
  defaultValue?: string;
}
interface FormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
  submitButtonText?: string;
  children?: ReactNode;
}
export declare function Form({
  fields,
  onSubmit,
  submitButtonText,
  children,
}: FormProps): import("react").JSX.Element;
//# sourceMappingURL=Form.d.ts.map
