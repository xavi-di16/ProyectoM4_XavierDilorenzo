import { FirebaseError } from 'firebase/app';

const messages: Record<string, string> = {
    'auth/invalid-credential':
        'El correo o la contraseña son incorrectos.',

    'auth/user-not-found':
        'El correo o la contraseña son incorrectos.',

    'auth/wrong-password':
        'El correo o la contraseña son incorrectos.',

    'auth/email-already-in-use':
        'Ya existe una cuenta con este correo electrónico.',

    'auth/invalid-email':
        'Ingresá un correo electrónico válido.',

    'auth/weak-password':
        'La contraseña debe tener al menos 6 caracteres.',

    'auth/too-many-requests':
        'Hubo demasiados intentos. Esperá un momento y volvé a intentar.',

    'auth/network-request-failed':
        'No se pudo conectar con Firebase. Revisá tu conexión.',

    'auth/popup-closed-by-user':
        'Cerraste la ventana de Google antes de terminar.',

    'auth/popup-blocked':
        'El navegador bloqueó la ventana de Google. Permití las ventanas emergentes para este sitio.',

    'auth/cancelled-popup-request':
        'Ya hay una operación de acceso con Google en curso.',

    'auth/unauthorized-domain':
        'Este dominio todavía no está autorizado en Firebase Authentication.',

    'auth/operation-not-allowed':
        'Este método de acceso todavía no está habilitado en Firebase.',

    'auth/user-disabled':
        'Esta cuenta está deshabilitada.',
};

export function getAuthErrorMessage(error: unknown): string {
    if (error instanceof FirebaseError) {
        return (
            messages[error.code] ??
            'No se pudo completar la operación. Intentá nuevamente.'
        );
    }

    return 'Ocurrió un error inesperado. Intentá nuevamente.';
}