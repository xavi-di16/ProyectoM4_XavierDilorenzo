import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where,
    type Unsubscribe,
} from 'firebase/firestore';

import { db } from '../../services/firebase';

import type {
    Task,
    TaskFormValues,
} from '../../types/task.types';

import { validateTask } from '../../utils/validateTask';
import { parseTask } from '../../utils/taskParser';

const COLLECTION_NAME = 'tasks';

function getValidatedValues(
    values: TaskFormValues,
): TaskFormValues {
    const errors = validateTask(values);

    if (errors.title || errors.description) {
        throw new Error(
            errors.title ??
            errors.description ??
            'Los datos de la tarea son inválidos.',
        );
    }

    return {
        title: values.title.trim(),
        description: values.description.trim(),
    };
}

export function subscribeToUserTasks(
    userId: string,
    onData: (tasks: Task[]) => void,
    onError: (error: Error) => void,
): Unsubscribe {
    const userTasksQuery = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
    );

    return onSnapshot(
        userTasksQuery,
        snapshot => {
            try {
                const tasks = snapshot.docs.map(document =>
                    parseTask(document.id, document.data()),
                );

                if (tasks.some(task => task.userId !== userId)) {
                    throw new Error(
                        'Se recibió una tarea con un propietario inválido.',
                    );
                }

                tasks.sort(
                    (a, b) =>
                        b.createdAt - a.createdAt ||
                        a.id.localeCompare(b.id),
                );

                onData(tasks);
            } catch (error) {
                onError(
                    error instanceof Error
                        ? error
                        : new Error('No se pudieron leer las tareas.'),
                );
            }
        },
        onError,
    );
}

export async function createTask(
    userId: string,
    values: TaskFormValues,
): Promise<void> {
    if (!userId) {
        throw new Error('Necesitás iniciar sesión.');
    }

    const validatedValues = getValidatedValues(values);
    const now = Date.now();

    await addDoc(collection(db, COLLECTION_NAME), {
        userId,
        ...validatedValues,
        completed: false,
        createdAt: now,
        updatedAt: now,
    });
}

export async function updateTask(
    taskId: string,
    values: TaskFormValues,
): Promise<void> {
    const validatedValues = getValidatedValues(values);

    await updateDoc(
        doc(db, COLLECTION_NAME, taskId),
        {
            ...validatedValues,
            updatedAt: Date.now(),
        },
    );
}

export async function setTaskCompleted(
    taskId: string,
    completed: boolean,
): Promise<void> {
    await updateDoc(
        doc(db, COLLECTION_NAME, taskId),
        {
            completed,
            updatedAt: Date.now(),
        },
    );
}

export async function deleteTask(
    taskId: string,
): Promise<void> {
    await deleteDoc(
        doc(db, COLLECTION_NAME, taskId),
    );
}