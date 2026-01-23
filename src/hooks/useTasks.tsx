import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';
import { db } from '@/db';
import type { Task } from '@/types';

interface UseTasksReturn {
  tasks: Task[] | undefined;
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  // Load tasks reactively with useLiveQuery
  const tasks = useLiveQuery(() => db.tasks.toArray());
  const isLoading = tasks === undefined;

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newTask: Omit<Task, 'id'> = {
      ...task,
      priority: task.priority || 'medium',
      createdAt: now,
      updatedAt: now,
    };
    await db.tasks.add(newTask as Task);
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    await db.tasks.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteTask = async (id: number) => {
    const task = await db.tasks.get(id);
    if (!task) return;

    await db.tasks.delete(id);

    toast(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Task deleted</span>
          <button
            onClick={async () => {
              await db.tasks.add(task);
              toast.dismiss(t.id);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a78bfa',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const toggleComplete = async (id: number) => {
    const task = await db.tasks.get(id);
    if (!task) return;

    const newCompleted = !task.completed;
    await db.tasks.update(id, {
      completed: newCompleted,
      updatedAt: new Date(),
    });

    const message = newCompleted ? 'Task completed' : 'Task reopened';
    toast(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{message}</span>
          <button
            onClick={async () => {
              await db.tasks.update(id, {
                completed: task.completed,
                updatedAt: new Date(),
              });
              toast.dismiss(t.id);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a78bfa',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000 }
    );
  };

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
  };
}
