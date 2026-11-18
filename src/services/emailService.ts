import { sendEmailVerification } from 'firebase/auth';
import { auth } from './firebase';

interface SummaryResponse {
    message: string;
}

export async function requestEmailVerification(): Promise<void> {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('Necesitás iniciar sesión.');
    }

    await sendEmailVerification(user);
}

export async function sendTasksSummaryEmail(): Promise<SummaryResponse> {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('Necesitás iniciar sesión.');
    }

    await user.reload();

    const token = await user.getIdToken(true);

    const response = await fetch('/api/send-summary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(30_000),
    });

    const data: unknown = await response
        .json()
        .catch(() => null);

    const message =
        data &&
            typeof data === 'object' &&
            'message' in data &&
            typeof data.message === 'string'
            ? data.message
            : 'El servidor devolvió una respuesta inválida.';

    if (!response.ok) {
        throw new Error(message);
    }

    if (
        !data ||
        typeof data !== 'object' ||
        !('message' in data) ||
        typeof data.message !== 'string'
    ) {
        throw new Error(message);
    }

    return { message };
}