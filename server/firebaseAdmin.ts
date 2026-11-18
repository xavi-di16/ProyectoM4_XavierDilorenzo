import {
    cert,
    getApps,
    initializeApp,
} from 'firebase-admin/app';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export function getAdminServices() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Faltan variables de entorno de Firebase Admin.',
        );
    }

    const app =
        getApps().find(item => item.name === 'matecode-server') ??
        initializeApp(
            {
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                projectId,
            },
            'matecode-server',
        );

    return {
        auth: getAuth(app),
        db: getFirestore(app),
    };
}
