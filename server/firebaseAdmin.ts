import { createPrivateKey } from 'node:crypto';

import {
    cert,
    getApps,
    initializeApp,
} from 'firebase-admin/app';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function requiredEnvironmentVariable(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(`Falta configurar ${name} en el servidor.`);
    }

    return value;
}

export function getAdminServices() {
    let app = getApps().find(item => item.name === 'matecode-server');

    if (!app) {
        const projectId = requiredEnvironmentVariable('FIREBASE_PROJECT_ID');
        const clientEmail = requiredEnvironmentVariable('FIREBASE_CLIENT_EMAIL');
        const privateKey = requiredEnvironmentVariable('FIREBASE_PRIVATE_KEY')
            .replace(/\\n/g, '\n')
            .replace(/\r\n/g, '\n');

        try {
            const key = createPrivateKey(privateKey);

            if (key.asymmetricKeyType !== 'rsa') {
                throw new Error('Se necesita una clave RSA.');
            }
        } catch {
            throw new Error(
                'FIREBASE_PRIVATE_KEY inválida. Copiá únicamente el campo ' +
                'private_key del JSON de la cuenta de servicio de Firebase, ' +
                'sin las comillas exteriores. Debe contener una clave privada RSA en formato PEM.',
            );
        }

        app = initializeApp(
            {
                credential: cert({ projectId, clientEmail, privateKey }),
                projectId,
            },
            'matecode-server',
        );
    }

    return {
        auth: getAuth(app),
        db: getFirestore(app),
    };
}
