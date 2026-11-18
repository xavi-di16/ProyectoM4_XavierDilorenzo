import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from 'firebase/auth';

import { auth } from '../../services/firebase';
import type { AuthFormValues } from '../../types/auth.types';

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: 'select_account',
});

export async function registerWithEmail({
    email,
    password,
}: AuthFormValues): Promise<void> {
    await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
    );
}

export async function loginWithEmail({
    email,
    password,
}: AuthFormValues): Promise<void> {
    await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
    );
}

export async function loginWithGoogle(): Promise<void> {
    await signInWithPopup(auth, googleProvider);
}

export async function logoutUser(): Promise<void> {
    await signOut(auth);
}