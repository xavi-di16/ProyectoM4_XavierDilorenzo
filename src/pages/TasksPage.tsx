import { useAuth } from '../hooks/useAuth';

export function TasksPage() {
    const { user } = useAuth();

    return (
        <section className="content-card">
            <h1>Mis tareas</h1>

            <p>
                Bienvenido, {user?.displayName || user?.email}.
            </p>

            <p className="muted">
                Tu sesión está activa. En el próximo paso vamos a incorporar
                la gestión de tareas con Firestore.
            </p>
        </section>
    );
}