import {
    getApp,
    getApps,
    initializeApp,
} from 'firebase/app';

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingVariables = Object.entries(firebaseConfig)
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key);

if (missingVariables.length > 0) {
    throw new Error(
        `Falta configurar Firebase en .env: ${missingVariables.join(', ')}`,
    );
}

const app = getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);