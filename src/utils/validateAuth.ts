import type { AuthFormValues } from '../types/auth.types';

export interface AuthFormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export function validateAuth(
    values: AuthFormValues,
    isRegister: boolean,
    confirmPassword: string,
): AuthFormErrors {
    const errors: AuthFormErrors = {};

    const email = values.email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        errors.email = 'Ingresá un correo electrónico válido.';
    }

    if (!values.password) {
        errors.password = 'Ingresá tu contraseña.';
    } else if (isRegister && values.password.length < 6) {
        errors.password =
            'La contraseña debe tener al menos 6 caracteres.';
    }

    if (isRegister && confirmPassword !== values.password) {
        errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    return errors;
}