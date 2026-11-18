import {
    useId,
    useState,
    type FormEvent,
} from 'react';

import { FormField } from './FormField';

import type {
    TaskFormErrors,
    TaskFormValues,
} from '../types/task.types';

import { validateTask } from '../utils/validateTask';
import { getTaskErrorMessage } from '../utils/taskErrors';

interface TodoFormProps {
    onSubmit: (values: TaskFormValues) => Promise<void>;
    initialValues?: TaskFormValues;
    onCancel?: () => void;
}

export function TodoForm({
    onSubmit,
    initialValues,
    onCancel,
}: TodoFormProps) {
    const descriptionId = useId();
    const descriptionErrorId = `${descriptionId}-error`;

    const [values, setValues] = useState<TaskFormValues>(
        initialValues ?? {
            title: '',
            description: '',
        },
    );

    const [errors, setErrors] = useState<TaskFormErrors>({});
    const [serverError, setServerError] =
        useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);

    const isEditing = initialValues !== undefined;

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();

        if (submitting) return;

        setServerError(null);

        const validationErrors = validateTask(values);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setSubmitting(true);

        try {
            await onSubmit({
                title: values.title.trim(),
                description: values.description.trim(),
            });

            if (!isEditing) {
                setValues({
                    title: '',
                    description: '',
                });
            }
        } catch (failure) {
            setServerError(getTaskErrorMessage(failure));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form
            className="todo-form"
            onSubmit={handleSubmit}
            aria-busy={submitting}
            noValidate
        >
            <h2>{isEditing ? 'Editar tarea' : 'Nueva tarea'}</h2>

            {serverError && (
                <p className="alert-error" role="alert">
                    {serverError}
                </p>
            )}

            <FormField
                label="Título"
                name="title"
                type="text"
                placeholder="Ejemplo: preparar la presentación"
                value={values.title}
                onChange={event =>
                    setValues(previous => ({
                        ...previous,
                        title: event.target.value,
                    }))
                }
                error={errors.title}
                maxLength={100}
                disabled={submitting}
                required
            />

            <div className="field">
                <label htmlFor={descriptionId}>
                    Descripción
                </label>

                <textarea
                    id={descriptionId}
                    name="description"
                    placeholder="Detalles de la tarea..."
                    value={values.description}
                    onChange={event =>
                        setValues(previous => ({
                            ...previous,
                            description: event.target.value,
                        }))
                    }
                    maxLength={300}
                    rows={3}
                    disabled={submitting}
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={
                        errors.description
                            ? descriptionErrorId
                            : undefined
                    }
                />

                {errors.description && (
                    <p
                        id={descriptionErrorId}
                        className="field-error"
                    >
                        {errors.description}
                    </p>
                )}
            </div>

            <div className="todo-actions">
                <button
                    className="btn-primary"
                    type="submit"
                    disabled={submitting}
                >
                    {submitting
                        ? 'Guardando...'
                        : isEditing
                            ? 'Guardar cambios'
                            : 'Agregar tarea'}
                </button>

                {onCancel && (
                    <button
                        className="btn-secondary"
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}