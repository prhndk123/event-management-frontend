import { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "~/modules/auth/auth.store";

interface PublicOnlyRouteProps {
  children: ReactNode;
}

/**
 * Route wrapper for pages that should only be accessible when NOT logged in
 * (e.g., login, register pages)
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
