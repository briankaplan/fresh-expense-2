import { ReactNode } from 'react';
import { UserRole } from '@fresh-expense/types';
interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: UserRole;
    redirectTo?: string;
}
export declare function ProtectedRoute({ children, requiredRole, redirectTo, }: ProtectedRouteProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=ProtectedRoute.d.ts.map