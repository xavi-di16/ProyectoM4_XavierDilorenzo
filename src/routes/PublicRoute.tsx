import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

interface PublicRouteProps {
    children: ReactNode;
}

export function PublicRoute({
    children,
}: PublicRouteProps) {
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

    if (user) {
        return <Navigate to="/tasks" replace />;
    }

    return <>{children}</>;
}