import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({
    children,
}: ProtectedRouteProps) {
    const { user, loading, error } = useAuth();

    if (loading) {
        return (
            <main className="screen-center">
                <p role="status">Comprobando sesión...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="screen-center">
                <p className="alert-error" role="alert">
                    {error}
                </p>
            </main>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}