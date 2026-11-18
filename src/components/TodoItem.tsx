import { useState } from 'react';

import { TodoForm } from './TodoForm';

import type {
    Task,
    TaskFormValues,
} from '../types/task.types';

import { getTaskErrorMessage } from '../utils/taskErrors';

interface TodoItemProps {
    task: Task;
    onToggle: (task: Task) => Promise<void>;
    onEdit: (
        taskId: string,
        values: TaskFormValues,
    ) => Promise<void>;
    onDelete: (taskId: string) => Promise<void>;
}

type TaskAction = 'toggle' | 'delete';

export function TodoItem({
    task,
    onToggle,
    onEdit,
    onDelete,
}: TodoItemProps) {
    const [editing, setEditing] = useState(false);
    const [action, setAction] =
        useState<TaskAction | null>(null);

    const [error, setError] = useState<string | null>(null);

    const busy = action !== null;

    async function perform(
        operation: () => Promise<void>,
        nextAction: TaskAction,
    ): Promise<void> {
        if (action) return;

        setError(null);
        setAction(nextAction);

        try {
            await operation();
        } catch (failure) {
            setError(getTaskErrorMessage(failure));
        } finally {
            setAction(null);
        }
    }

    if (editing) {
        return (
            <li className="todo-item todo-item--editing">
                <TodoForm
                    initialValues={{
                        title: task.title,
                        description: task.description,
                    }}
                    onSubmit={async values => {
                        await onEdit(task.id, values);
                        setEditing(false);
                    }}
                    onCancel={() => setEditing(false)}
                />
            </li>
        );
    }

    return (
        <li
            className={`todo-item ${task.completed ? 'todo-item--completed' : ''
                }`}
            aria-busy={busy}
        >
            <div className="todo-main">
                <input
                    className="task-checkbox"
                    type="checkbox"
                    checked={task.completed}
                    disabled={busy}
                    aria-label={`${task.completed
                            ? 'Marcar como pendiente'
                            : 'Marcar como completada'
                        }: ${task.title}`}
                    onChange={() =>
                        void perform(
                            () => onToggle(task),
                            'toggle',
                        )
                    }
                />

                <div className="todo-content">
                    <h3 className="todo-title">
                        {task.title}
                    </h3>

                    {task.description && (
                        <p className="todo-description">
                            {task.description}
                        </p>
                    )}

                    <span className="task-status">
                        {task.completed ? 'Completada' : 'Pendiente'}
                    </span>

                    {action === 'toggle' && (
                        <p role="status">Actualizando estado...</p>
                    )}
                </div>
            </div>

            <div className="todo-actions">
                <button
                    className="btn-secondary"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                        setError(null);
                        setEditing(true);
                    }}
                >
                    Editar
                </button>

                <button
                    className="btn-danger"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                        void perform(
                            () => onDelete(task.id),
                            'delete',
                        )
                    }
                >
                    {action === 'delete'
                        ? 'Eliminando...'
                        : 'Eliminar'}
                </button>
            </div>

            {error && (
                <p className="alert-error task-error" role="alert">
                    {error}
                </p>
            )}
        </li>
    );
}