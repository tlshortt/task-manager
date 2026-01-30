import { useQuery, useMutation } from 'convex/react';
import toast from 'react-hot-toast';
import { api } from '../../convex/_generated/api';
import type { Task, Id, Priority } from '@/types';
import { mapTaskDocToTask, mapTaskToArgs } from '@/utils/convexMappers';
import { isValidRecurrence } from '@/utils/recurrenceUtils';

interface UseTasksReturn {
  tasks: Task[] | undefined;
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: Id<'tasks'>, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: Id<'tasks'>) => Promise<void>;
  toggleComplete: (id: Id<'tasks'>) => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  // Load tasks reactively with Convex useQuery
  const taskDocs = useQuery(api.tasks.list);
  const tasks = taskDocs?.map(mapTaskDocToTask);
  const isLoading = tasks === undefined;

  // Convex mutations
  const createMutation = useMutation(api.tasks.create);
  const updateMutation = useMutation(api.tasks.update);
  const removeMutation = useMutation(api.tasks.remove);
  const toggleMutation = useMutation(api.tasks.toggleComplete);
  const generateInstancesMutation = useMutation(api.tasks.generateInstances);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const taskArgs = mapTaskToArgs(task);

    if (task.recurrence && isValidRecurrence(task.recurrence)) {
      // Create recurring parent task
      const parentId = await createMutation(taskArgs);

      // Generate instances
      await generateInstancesMutation({
        parentId,
        lookaheadDays: 90,
      });
    } else {
      // Create regular task
      await createMutation(taskArgs);
    }
  };

  const updateTask = async (id: Id<'tasks'>, updates: Partial<Task>) => {
    // Extract only the fields that can be updated
    const updateArgs: {
      id: Id<'tasks'>;
      title?: string;
      description?: string;
      completed?: boolean;
      priority?: Priority;
      dueDateMs?: number;
      subtasks?: Array<{
        id: string;
        title: string;
        completed: boolean;
        priority?: Priority;
        dueDateMs?: number;
      }>;
      tagIds?: Id<'tags'>[];
      isCustomized?: boolean;
    } = { id };

    if (updates.title !== undefined) updateArgs.title = updates.title;
    if (updates.description !== undefined) updateArgs.description = updates.description;
    if (updates.completed !== undefined) updateArgs.completed = updates.completed;
    if (updates.priority !== undefined) updateArgs.priority = updates.priority;
    if (updates.dueDate !== undefined) {
      updateArgs.dueDateMs = updates.dueDate ? updates.dueDate.getTime() : undefined;
    }
    if (updates.subtasks !== undefined) {
      updateArgs.subtasks = updates.subtasks?.map((st: import('@/types').Subtask) => ({
        id: st.id,
        title: st.title,
        completed: st.completed,
        priority: st.priority,
        dueDateMs: st.dueDate ? st.dueDate.getTime() : undefined,
      }));
    }
    if (updates.tagIds !== undefined) updateArgs.tagIds = updates.tagIds;
    if (updates.isCustomized !== undefined) updateArgs.isCustomized = updates.isCustomized;

    await updateMutation(updateArgs);
  };

  const deleteTask = async (id: Id<'tasks'>) => {
    const deletedTask = await removeMutation({ id });

    toast(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Task deleted</span>
          <button
            onClick={async () => {
              // Restore the deleted task
              const restoreArgs = mapTaskToArgs({
                title: deletedTask.title,
                description: deletedTask.description,
                completed: deletedTask.completed,
                priority: deletedTask.priority,
                dueDate: deletedTask.dueDateMs ? new Date(deletedTask.dueDateMs) : undefined,
                subtasks: deletedTask.subtasks?.map((st: {
                  id: string;
                  title: string;
                  completed: boolean;
                  priority?: Priority;
                  dueDateMs?: number;
                }) => ({
                  id: st.id,
                  title: st.title,
                  completed: st.completed,
                  priority: st.priority,
                  dueDate: st.dueDateMs ? new Date(st.dueDateMs) : undefined,
                })),
                tagIds: deletedTask.tagIds,
                recurrence: deletedTask.recurrence,
              });
              await createMutation(restoreArgs);
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

  const toggleComplete = async (id: Id<'tasks'>) => {
    const oldCompleted = await toggleMutation({ id });

    const message = !oldCompleted ? 'Task completed' : 'Task reopened';
    toast(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{message}</span>
          <button
            onClick={async () => {
              // Toggle back to previous state
              await toggleMutation({ id });
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
