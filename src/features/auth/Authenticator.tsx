import {
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import {
    onAuthStateChanged,
    type User,
} from 'firebase/auth';

import { auth } from '../../services/firebase';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from '../../types/auth.types';

interface AuthenticatorProps {
    children: ReactNode;
}

export function Authenticator({
    children,
}: AuthenticatorProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            currentUser => {
                setUser(currentUser);
                setError(null);
                setLoading(false);
            },
            () => {
                setUser(null);
                setError(
                    'No se pudo comprobar la sesión. Revisá tu conexión e intentá nuevamente.',
                );
                setLoading(false);
            },
        );

        return unsubscribe;
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            error,
        }),
        [user, loading, error],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}