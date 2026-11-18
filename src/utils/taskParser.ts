import type { Task } from '../types/task.types';
import { validateTask } from './validateTask.js';

export function parseTask(
    id: string,
    raw: unknown,
): Task {
    if (
        !raw ||
        typeof raw !== 'object' ||
        Array.isArray(raw)
    ) {
        throw new Error('Hay una tarea con formato inválido.');
    }

    const data = raw as Record<string, unknown>;

    const {
        userId,
        title,
        description,
        completed,
        createdAt,
        updatedAt,
    } = data;

    if (
        typeof userId !== 'string' ||
        !userId ||
        typeof title !== 'string' ||
        typeof description !== 'string' ||
        typeof completed !== 'boolean' ||
        typeof createdAt !== 'number' ||
        !Number.isSafeInteger(createdAt) ||
        createdAt < 0 ||
        typeof updatedAt !== 'number' ||
        !Number.isSafeInteger(updatedAt) ||
        updatedAt < createdAt
    ) {
        throw new Error(
            'Hay una tarea con datos incompatibles en Firestore.',
        );
    }

    const errors = validateTask({ title, description });

    if (errors.title || errors.description) {
        throw new Error(
            'Hay una tarea que no cumple las validaciones.',
        );
    }

    return {
        id,
        userId,
        title,
        description,
        completed,
        createdAt,
        updatedAt,
    };
}