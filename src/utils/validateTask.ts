import type {
    TaskFormErrors,
    TaskFormValues,
} from '../types/task.types';

export function validateTask(
    values: TaskFormValues,
): TaskFormErrors {
    const errors: TaskFormErrors = {};

    if (!values.title.trim()) {
        errors.title = 'El título es obligatorio.';
    } else if (values.title.length > 100) {
        errors.title = 'El título admite hasta 100 caracteres.';
    }

    if (values.description.length > 300) {
        errors.description =
            'La descripción admite hasta 300 caracteres.';
    }

    return errors;
}