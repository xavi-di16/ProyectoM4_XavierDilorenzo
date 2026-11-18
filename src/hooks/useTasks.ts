import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    createTask,
    deleteTask,
    setTaskCompleted,
    subscribeToUserTasks,
    updateTask,
} from '../features/tasks/taskService';

import type {
    Task,
    TaskFilter,
    TaskFormValues,
} from '../types/task.types';

import { getTaskErrorMessage } from '../utils/taskErrors';

interface TasksState {
    owner: string;
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

export function useTasks(userId: string) {
    const [state, setState] = useState<TasksState>({
        owner: userId,
        tasks: [],
        loading: true,
        error: null,
    });

    const [filter, setFilter] = useState<TaskFilter>('all');

    useEffect(() => {
        let active = true;

        const unsubscribe = subscribeToUserTasks(
            userId,
            tasks => {
                if (!active) return;

                setState({
                    owner: userId,
                    tasks,
                    loading: false,
                    error: null,
                });
            },
            failure => {
                if (!active) return;

                setState({
                    owner: userId,
                    tasks: [],
                    loading: false,
                    error: getTaskErrorMessage(failure),
                });
            },
        );

        return () => {
            active = false;
            unsubscribe();
        };
    }, [userId]);

    const current: TasksState =
        state.owner === userId
            ? state
            : {
                owner: userId,
                tasks: [],
                loading: true,
                error: null,
            };

    const addTask = useCallback(
        (values: TaskFormValues) =>
            createTask(userId, values),
        [userId],
    );

    const editTask = useCallback(
        (taskId: string, values: TaskFormValues) =>
            updateTask(taskId, values),
        [],
    );

    const toggleTask = useCallback(
        (task: Task) =>
            setTaskCompleted(task.id, !task.completed),
        [],
    );

    const removeTask = useCallback(
        (taskId: string) => deleteTask(taskId),
        [],
    );

    const { tasks, loading, error } = current;

    const filteredTasks = tasks.filter(task => {
        if (filter === 'pending') return !task.completed;
        if (filter === 'completed') return task.completed;

        return true;
    });

    const counts = {
        all: tasks.length,
        pending: tasks.filter(task => !task.completed).length,
        completed: tasks.filter(task => task.completed).length,
    };

    return {
        tasks,
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
    };
}