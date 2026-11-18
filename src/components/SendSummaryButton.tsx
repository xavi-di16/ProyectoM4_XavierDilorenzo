import { useState } from 'react';
import { FirebaseError } from 'firebase/app';

import { useAuth } from '../hooks/useAuth';

import {
    requestEmailVerification,
    sendTasksSummaryEmail,
} from '../services/emailService';

import { getAuthErrorMessage } from '../utils/firebaseErrors';

type EmailStatus = 'idle' | 'loading' | 'success' | 'error';
type EmailAction = 'summary' | 'verification';

export function SendSummaryButton() {
    const { user } = useAuth();

    const [status, setStatus] =
        useState<EmailStatus>('idle');

    const [action, setAction] =
        useState<EmailAction | null>(null);

    const [message, setMessage] = useState('');

    const busy = status === 'loading';

    async function perform(
        nextAction: EmailAction,
        operation: () => Promise<string>,
    ): Promise<void> {
        if (busy) return;

        setStatus('loading');
        setAction(nextAction);
        setMessage('');

        try {
            const result = await operation();

            setMessage(result);
            setStatus('success');
        } catch (error) {
            const errorMessage =
                error instanceof FirebaseError
                    ? getAuthErrorMessage(error)
                    : error instanceof Error
                        ? error.message
                        : 'No se pudo completar la operación.';

            setMessage(errorMessage);
            setStatus('error');
        } finally {
            setAction(null);
        }
    }

    return (
        <div className="email-actions">
            <button
                className="btn-primary"
                type="button"
                disabled={!user || busy}
                onClick={() =>
                    void perform('summary', async () => {
                        const result = await sendTasksSummaryEmail();
                        return result.message;
                    })
                }
            >
                {busy && action === 'summary'
                    ? 'Enviando resumen...'
                    : 'Enviar resumen por email'}
            </button>

            {user && !user.emailVerified && (
                <button
                    className="btn-secondary"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                        void perform('verification', async () => {
                            await requestEmailVerification();

                            return (
                                'Te enviamos un enlace de Firebase. ' +
                                'Abrilo y después volvé a enviar el resumen.'
                            );
                        })
                    }
                >
                    {busy && action === 'verification'
                        ? 'Enviando verificación...'
                        : 'Verificar mi correo'}
                </button>
            )}

            {message && (
                <p
                    className={
                        status === 'error'
                            ? 'alert-error'
                            : 'email-feedback'
                    }
                    role={status === 'error' ? 'alert' : 'status'}
                >
                    {message}
                </p>
            )}
        </div>
    );
}