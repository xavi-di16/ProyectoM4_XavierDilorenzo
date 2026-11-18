export interface Task {
    id: string;
    userId: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface TaskFormValues {
    title: string;
    description: string;
}

export type TaskFilter = 'all' | 'pending' | 'completed';