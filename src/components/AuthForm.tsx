import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { FormField } from './FormField';

import {
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
} from '../features/auth/authService';

import { getAuthErrorMessage } from '../utils/firebaseErrors';

import {
    validateAuth,
    type AuthFormErrors,
} from '../utils/validateAuth';

import type { AuthFormValues } from '../types/auth.types';

interface AuthFormProps {
    mode: 'login' | 'register';
}

type SubmitMethod = 'email' | 'google';

export function AuthForm({ mode }: AuthFormProps) {
    const isRegister = mode === 'register';

    const [values, setValues] = useState<AuthFormValues>({
        email: '',
        password: '',
    });

    const [confirmPassword, setConfirmPassword] = useState('');

    const [errors, setErrors] = useState<AuthFormErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);

    const [submitting, setSubmitting] =
        useState<SubmitMethod | null>(null);

    const busy = submitting !== null;

    async function perform(
        operation: () => Promise<void>,
        method: SubmitMethod,
    ): Promise<void> {
        if (submitting) return;

        setServerError(null);
        setSubmitting(method);

        try {
            await operation();
        } catch (error) {
            setServerError(getAuthErrorMessage(error));
        } finally {
            setSubmitting(null);
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();
        setServerError(null);

        const validationErrors = validateAuth(
            values,
            isRegister,
            confirmPassword,
        );

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        const operation = isRegister
            ? registerWithEmail
            : loginWithEmail;

        await perform(() => operation(values), 'email');
    }

    function handleGoogle(): void {
        setErrors({});
        void perform(loginWithGoogle, 'google');
    }

    return (
        <main className="auth-container">
            <section className="auth-card">
                <p className="brand">MateCode</p>

                <h1>
                    {isRegister ? 'Crear una cuenta' : 'Iniciar sesión'}
                </h1>

                <p className="muted">
                    Organizá tus tareas y consultalas desde cualquier dispositivo.
                </p>

                {serverError && (
                    <div className="alert-error" role="alert">
                        {serverError}
                    </div>
                )}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <FormField
                        label="Correo electrónico"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="nombre@ejemplo.com"
                        value={values.email}
                        onChange={event =>
                            setValues(previous => ({
                                ...previous,
                                email: event.target.value,
                            }))
                        }
                        error={errors.email}
                        disabled={busy}
                        required
                    />

                    <FormField
                        label="Contraseña"
                        name="password"
                        type="password"
                        autoComplete={
                            isRegister ? 'new-password' : 'current-password'
                        }
                        value={values.password}
                        onChange={event =>
                            setValues(previous => ({
                                ...previous,
                                password: event.target.value,
                            }))
                        }
                        error={errors.password}
                        disabled={busy}
                        required
                    />

                    {isRegister && (
                        <FormField
                            label="Confirmar contraseña"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={event =>
                                setConfirmPassword(event.target.value)
                            }
                            error={errors.confirmPassword}
                            disabled={busy}
                            required
                        />
                    )}

                    <button
                        className="btn-primary"
                        type="submit"
                        disabled={busy}
                    >
                        {submitting === 'email'
                            ? 'Procesando...'
                            : isRegister
                                ? 'Crear cuenta'
                                : 'Ingresar'}
                    </button>
                </form>

                <div className="divider">o</div>

                <button
                    className="btn-secondary"
                    type="button"
                    onClick={handleGoogle}
                    disabled={busy}
                >
                    {submitting === 'google'
                        ? 'Conectando con Google...'
                        : 'Continuar con Google'}
                </button>

                <p className="auth-footer">
                    {isRegister ? '¿Ya tenés cuenta? ' : '¿Todavía no tenés cuenta? '}

                    <Link to={isRegister ? '/login' : '/register'}>
                        {isRegister ? 'Iniciá sesión' : 'Registrate'}
                    </Link>
                </p>
            </section>
        </main>
    );
}