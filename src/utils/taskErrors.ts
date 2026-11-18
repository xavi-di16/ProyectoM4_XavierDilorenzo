import { FirebaseError } from 'firebase/app';

const messages: Record<string, string> = {
    'permission-denied':
        'Tu cuenta no tiene permiso para realizar esta operación.',

    unauthenticated:
        'Necesitás iniciar sesión para gestionar tus tareas.',

    unavailable:
        'No se pudo conectar con Firestore. Revisá tu conexión.',

    'failed-precondition':
        'Es necesario revisar la configuración de Firestore.',
};

export function getTaskErrorMessage(
    error: unknown,
): string {
    if (error instanceof FirebaseError) {
        return (
            messages[error.code] ??
            'No se pudo completar la operación con Firestore.'
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'No se pudo completar la operación. Intentá nuevamente.';
}