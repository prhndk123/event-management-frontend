import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '~/store/auth-store';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: 'CUSTOMER' | 'ORGANIZER';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const location = useLocation();
    const { isAuthenticated, user, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    // Authenticated but wrong role
    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
}
