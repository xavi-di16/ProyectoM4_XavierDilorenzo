import {
    useId,
    type InputHTMLAttributes,
} from 'react';

interface FormFieldProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export function FormField({
    label,
    error,
    id,
    ...inputProps
}: FormFieldProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
        <div className="field">
            <label htmlFor={inputId}>{label}</label>

            <input
                {...inputProps}
                id={inputId}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
            />

            {error && (
                <p id={errorId} className="field-error">
                    {error}
                </p>
            )}
        </div>
    );
}