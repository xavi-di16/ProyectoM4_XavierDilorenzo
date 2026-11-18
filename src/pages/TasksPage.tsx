import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';

import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';

import type { TaskFilter } from '../types/task.types';

const filters: {
    key: TaskFilter;
    label: string;
}[] = [
        { key: 'all', label: 'Todas' },
        { key: 'pending', label: 'Pendientes' },
        { key: 'completed', label: 'Completadas' },
    ];

function UserTasks({ userId }: { userId: string }) {
    const {
        filteredTasks,
        counts,
        loading,
        error,
        filter,
        setFilter,
        addTask,
        editTask,
        toggleTask,
        removeTask,
    } = useTasks(userId);

    return (
        <div className="tasks-page">
            <div className="page-heading">
                <h1>Mis tareas</h1>

                <p className="muted">
                    Organizá tus pendientes y registrá tus avances.
                </p>
            </div>

            <section
                className="content-card"
                aria-label="Crear una tarea"
            >
                <TodoForm onSubmit={addTask} />
            </section>

            <section
                className="tasks-panel"
                aria-label="Listado de tareas"
            >
                <div
                    className="filter-bar"
                    role="group"
                    aria-label="Filtrar tareas"
                >
                    {filters.map(({ key, label }) => (
                        <button
                            key={key}
                            className="filter-btn"
                            type="button"
                            aria-pressed={filter === key}
                            onClick={() => setFilter(key)}
                        >
                            {label} ({counts[key]})
                        </button>
                    ))}
                </div>

                {error ? (
                    <p className="alert-error" role="alert">
                        No se pudieron cargar tus tareas. {error}
                    </p>
                ) : (
                    <TodoList
                        tasks={filteredTasks}
                        loading={loading}
                        onToggle={toggleTask}
                        onEdit={editTask}
                        onDelete={removeTask}
                    />
                )}
            </section>
        </div>
    );
}

export function TasksPage() {
    const { user } = useAuth();

    return user ? (
        <UserTasks
            key={user.uid}
            userId={user.uid}
        />
    ) : null;
}