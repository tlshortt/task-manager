# Phase 4: Update React Hooks

## Overview
Replace Dexie hooks with Convex hooks in React layer.

**Estimated time:** ~2 hours

## Tasks

### 4.1 Create Type Mappers (`src/utils/convexMappers.ts`)

```ts
import type { Doc } from '../../convex/_generated/dataModel';
import type { Task, Subtask, RecurrencePattern } from '@/types';

export function mapTaskDocToTask(doc: Doc<'tasks'>): Task {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    completed: doc.completed,
    priority: doc.priority,
    dueDate: doc.dueDateMs ? new Date(doc.dueDateMs) : undefined,
    subtasks: doc.subtasks?.map(mapSubtaskDocToSubtask),
    categoryIds: doc.categoryIds,
    createdAt: new Date(doc.createdAtMs),
    updatedAt: new Date(doc.updatedAtMs),
    isRecurringParent: doc.isRecurringParent,
    recurringParentId: doc.recurringParentId,
    recurrence: doc.recurrence ? mapRecurrenceDocToPattern(doc.recurrence) : undefined,
    instanceDate: doc.instanceDateMs ? new Date(doc.instanceDateMs) : undefined,
    isCustomized: doc.isCustomized,
  };
}

function mapSubtaskDocToSubtask(doc: /* subtask doc type */): Subtask {
  return {
    id: doc.id,
    title: doc.title,
    completed: doc.completed,
    priority: doc.priority,
    dueDate: doc.dueDateMs ? new Date(doc.dueDateMs) : undefined,
  };
}

function mapRecurrenceDocToPattern(doc: /* recurrence doc type */): RecurrencePattern {
  return {
    frequency: doc.frequency,
    interval: doc.interval,
    daysOfWeek: doc.daysOfWeek,
    dayOfMonth: doc.dayOfMonth,
    endDate: doc.endDateMs ? new Date(doc.endDateMs) : undefined,
    count: doc.count,
  };
}

// Reverse mapper for creating/updating
export function mapTaskToArgs(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  return {
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    dueDateMs: task.dueDate?.getTime(),
    subtasks: task.subtasks?.map((s) => ({
      id: s.id,
      title: s.title,
      completed: s.completed,
      priority: s.priority,
      dueDateMs: s.dueDate?.getTime(),
    })),
    categoryIds: task.categoryIds,
    recurrence: task.recurrence ? {
      frequency: task.recurrence.frequency,
      interval: task.recurrence.interval,
      daysOfWeek: task.recurrence.daysOfWeek,
      dayOfMonth: task.recurrence.dayOfMonth,
      endDateMs: task.recurrence.endDate?.getTime(),
      count: task.recurrence.count,
    } : undefined,
  };
}
```

### 4.2 Update Types (`src/types/index.ts`)

```ts
import type { Id } from '../../convex/_generated/dataModel';

export interface Task {
  id?: Id<'tasks'>;  // Changed from number
  // ... rest stays same
  recurringParentId?: Id<'tasks'>;  // Changed from number
  categoryIds?: Id<'categories'>[];  // Changed from Category[]
}
```

### 4.3 Rewrite useTasks Hook

```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import toast from 'react-hot-toast';
import type { Task } from '@/types';
import { mapTaskDocToTask, mapTaskToArgs } from '@/utils/convexMappers';

interface UseTasksReturn {
  tasks: Task[] | undefined;
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: Id<'tasks'>, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: Id<'tasks'>) => Promise<void>;
  toggleComplete: (id: Id<'tasks'>) => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const tasksData = useQuery(api.tasks.list);
  const tasks = tasksData?.map(mapTaskDocToTask);
  const isLoading = tasksData === undefined;

  const createMutation = useMutation(api.tasks.create);
  const updateMutation = useMutation(api.tasks.update);
  const removeMutation = useMutation(api.tasks.remove);
  const toggleMutation = useMutation(api.tasks.toggleComplete);
  const restoreMutation = useMutation(api.tasks.create); // For undo

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createMutation(mapTaskToArgs(task));
  };

  const updateTask = async (id: Id<'tasks'>, updates: Partial<Task>) => {
    await updateMutation({ id, ...mapTaskToArgs(updates) });
  };

  const deleteTask = async (id: Id<'tasks'>) => {
    const deleted = await removeMutation({ id });
    if (!deleted) return;

    toast(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Task deleted</span>
          <button
            onClick={async () => {
              // Restore creates new task (new ID)
              await restoreMutation({
                title: deleted.title,
                // ... map other fields
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

  const toggleComplete = async (id: Id<'tasks'>) => {
    const result = await toggleMutation({ id });
    const message = result.oldCompleted ? 'Task reopened' : 'Task completed';

    toast(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{message}</span>
          <button
            onClick={async () => {
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

  return { tasks, isLoading, addTask, updateTask, deleteTask, toggleComplete };
}
```

### 4.4 Update useRecurringTasks Hook

```ts
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

export function useRecurringTasks() {
  const deleteSeriesMutation = useMutation(api.tasks.deleteSeries);
  const updateSeriesMutation = useMutation(api.tasks.updateSeries);
  const generateInstancesMutation = useMutation(api.tasks.generateInstances);

  const deleteRecurringSeries = async (parentId: Id<'tasks'>) => {
    await deleteSeriesMutation({ parentId });
  };

  const updateRecurringSeries = async (parentId: Id<'tasks'>, updates: Partial<Task>) => {
    await updateSeriesMutation({ parentId, updates: mapTaskToArgs(updates) });
  };

  const extendLookaheadWindow = async (parentId: Id<'tasks'>) => {
    await generateInstancesMutation({ parentId });
  };

  return { deleteRecurringSeries, updateRecurringSeries, extendLookaheadWindow };
}
```

### 4.5 Update Component ID References
Search and replace in components:
- `id: number` → `id: Id<'tasks'>`
- `task.id` comparisons work the same (string comparison)

## Acceptance Criteria
- [ ] `useTasks` uses Convex hooks
- [ ] Tasks display correctly with mapped data
- [ ] Create/update/delete work
- [ ] Undo toasts function correctly
- [ ] Recurring task operations work
- [ ] No TypeScript errors

## Dependencies
- Phase 3 complete (Convex functions working)

## Notes
- Undo creates new task with new ID (acceptable for most UIs)
- Real-time sync is automatic — no manual refresh needed
- `useQuery` returns `undefined` while loading (same pattern as before)
