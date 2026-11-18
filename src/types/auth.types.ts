import type { User } from 'firebase/auth';

export interface AuthContextValue {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface AuthFormValues {
    email: string;
    password: string;
}