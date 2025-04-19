import type { UserRole } from "@fresh-expense/types";
import type { ReactNode } from "react";
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}
export declare function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
}: ProtectedRouteProps): import("react").JSX.Element | null;
//# sourceMappingURL=ProtectedRoute.d.ts.map
