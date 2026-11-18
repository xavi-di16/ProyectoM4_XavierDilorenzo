import { useContext } from 'react';
import { AuthContext } from '../features/auth/AuthContext';
import type { AuthContextValue } from '../types/auth.types';

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth debe utilizarse dentro de Authenticator.',
        );
    }

    return context;
}