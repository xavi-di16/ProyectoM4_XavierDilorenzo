import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../features/auth/authService';
import { getAuthErrorMessage } from '../utils/firebaseErrors';

export function AppLayout() {
    const { user } = useAuth();

    const [closingSession, setClosingSession] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogout(): Promise<void> {
        setError(null);
        setClosingSession(true);

        try {
            await logoutUser();
        } catch (failure) {
            setError(getAuthErrorMessage(failure));
        } finally {
            setClosingSession(false);
        }
    }

    return (
        <div className="app-shell">
            <header className="app-header">
                <div>
                    <Link className="brand" to="/tasks">
                        MateCode
                    </Link>

                    <p className="user-email">
                        {user?.displayName || user?.email}
                    </p>
                </div>

                <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => void handleLogout()}
                    disabled={closingSession}
                >
                    {closingSession ? 'Cerrando sesión...' : 'Cerrar sesión'}
                </button>
            </header>

            <main className="main-content">
                {error && (
                    <p className="alert-error" role="alert">
                        {error}
                    </p>
                )}

                <Outlet />
            </main>
        </div>
    );
}