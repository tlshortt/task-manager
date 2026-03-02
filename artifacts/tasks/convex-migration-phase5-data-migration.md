# Phase 5: Data Migration

## Overview
One-time import of existing Dexie data to Convex.

**Estimated time:** ~1 hour

## Tasks

### 5.1 Create Import Mutation (`convex/import.ts`)

```ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';

const importCategoryValidator = v.object({
  oldId: v.number(),
  name: v.string(),
  color: v.string(),
});

const importTaskValidator = v.object({
  title: v.string(),
  description: v.optional(v.string()),
  completed: v.boolean(),
  priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
  dueDateMs: v.optional(v.number()),
  subtasks: v.optional(v.array(v.object({
    id: v.string(),
    title: v.string(),
    completed: v.boolean(),
    priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
    dueDateMs: v.optional(v.number()),
  }))),
  oldCategoryIds: v.optional(v.array(v.number())),
  createdAtMs: v.number(),
  updatedAtMs: v.number(),
  isRecurringParent: v.optional(v.boolean()),
  oldRecurringParentId: v.optional(v.number()),
  recurrence: v.optional(v.object({
    frequency: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly'), v.literal('yearly')),
    interval: v.number(),
    daysOfWeek: v.optional(v.array(v.number())),
    dayOfMonth: v.optional(v.number()),
    endDateMs: v.optional(v.number()),
    count: v.optional(v.number()),
  })),
  instanceDateMs: v.optional(v.number()),
  isCustomized: v.optional(v.boolean()),
  oldId: v.number(),
});

export const importFromDexie = mutation({
  args: {
    categories: v.array(importCategoryValidator),
    tasks: v.array(importTaskValidator),
  },
  handler: async (ctx, args) => {
    // Map old category IDs to new Convex IDs
    const categoryIdMap = new Map<number, Id<'categories'>>();
    
    for (const category of args.categories) {
      const newId = await ctx.db.insert('categories', {
        name: category.name,
        color: category.color,
      });
      categoryIdMap.set(category.oldId, newId);
    }

    // Map old task IDs to new Convex IDs (for recurring parent references)
    const taskIdMap = new Map<number, Id<'tasks'>>();

    // First pass: insert all tasks without recurringParentId
    for (const task of args.tasks) {
      const newCategoryIds = task.oldCategoryIds
        ?.map((oldId) => categoryIdMap.get(oldId))
        .filter((id): id is Id<'categories'> => id !== undefined);

      const newId = await ctx.db.insert('tasks', {
        title: task.title,
        description: task.description,
        completed: task.completed,
        priority: task.priority,
        dueDateMs: task.dueDateMs,
        subtasks: task.subtasks,
        categoryIds: newCategoryIds,
        createdAtMs: task.createdAtMs,
        updatedAtMs: task.updatedAtMs,
        isRecurringParent: task.isRecurringParent,
        recurrence: task.recurrence,
        instanceDateMs: task.instanceDateMs,
        isCustomized: task.isCustomized,
        // recurringParentId set in second pass
      });
      
      taskIdMap.set(task.oldId, newId);
    }

    // Second pass: update recurringParentId references
    for (const task of args.tasks) {
      if (task.oldRecurringParentId !== undefined) {
        const newTaskId = taskIdMap.get(task.oldId);
        const newParentId = taskIdMap.get(task.oldRecurringParentId);
        
        if (newTaskId && newParentId) {
          await ctx.db.patch(newTaskId, {
            recurringParentId: newParentId,
          });
        }
      }
    }

    return {
      categoriesImported: args.categories.length,
      tasksImported: args.tasks.length,
    };
  },
});
```

### 5.2 Create Migration Component (`src/components/DataMigration.tsx`)

```tsx
import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { db } from '@/db'; // Old Dexie db

const MIGRATION_KEY = 'convex_migrated';

export function DataMigration({ children }: { children: React.ReactNode }) {
  const [migrating, setMigrating] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const importMutation = useMutation(api.import.importFromDexie);

  useEffect(() => {
    const checkMigration = async () => {
      if (localStorage.getItem(MIGRATION_KEY)) {
        return;
      }
      
      const tasks = await db.tasks.count();
      const categories = await db.categories.count();
      
      if (tasks > 0 || categories > 0) {
        setNeedsMigration(true);
      } else {
        localStorage.setItem(MIGRATION_KEY, 'true');
      }
    };
    
    checkMigration();
  }, []);

  const handleMigrate = async () => {
    setMigrating(true);
    
    try {
      const tasks = await db.tasks.toArray();
      const categories = await db.categories.toArray();

      const mappedCategories = categories.map((category) => ({
        oldId: category.id!,
        name: category.name,
        color: category.color,
      }));

      const mappedTasks = tasks.map((task) => ({
        oldId: task.id!,
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
        oldCategoryIds: task.categories?.map((t) => t.id),
        createdAtMs: task.createdAt.getTime(),
        updatedAtMs: task.updatedAt.getTime(),
        isRecurringParent: task.isRecurringParent,
        oldRecurringParentId: task.recurringParentId,
        recurrence: task.recurrence ? {
          frequency: task.recurrence.frequency,
          interval: task.recurrence.interval,
          daysOfWeek: task.recurrence.daysOfWeek,
          dayOfMonth: task.recurrence.dayOfMonth,
          endDateMs: task.recurrence.endDate?.getTime(),
          count: task.recurrence.count,
        } : undefined,
        instanceDateMs: task.instanceDate?.getTime(),
        isCustomized: task.isCustomized,
      }));

      await importMutation({ categories: mappedCategories, tasks: mappedTasks });
      
      localStorage.setItem(MIGRATION_KEY, 'true');
      setNeedsMigration(false);
    } catch (error) {
      console.error('Migration failed:', error);
      alert('Migration failed. Please try again.');
    } finally {
      setMigrating(false);
    }
  };

  if (needsMigration) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            Migrate Your Data
          </h2>
          <p className="text-gray-400 mb-6">
            We found existing tasks. Import them to the cloud?
          </p>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {migrating ? 'Migrating...' : 'Import Data'}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 5.3 Wrap App with Migration Component

In `App.tsx`:
```tsx
import { DataMigration } from '@/components/DataMigration';

export default function App() {
  return (
    <DataMigration>
      {/* existing app content */}
    </DataMigration>
  );
}
```

## Acceptance Criteria
- [ ] Import mutation handles categories and tasks
- [ ] ID references correctly mapped (categories, recurring parents)
- [ ] Migration UI shows for users with existing data
- [ ] Migration completes successfully
- [ ] `localStorage` flag prevents re-migration
- [ ] App works normally after migration

## Dependencies
- Phase 4 complete (hooks using Convex)

## Notes
- Migration is one-time per browser
- Old Dexie data remains (cleanup in Phase 6)
- New IDs assigned — bookmarks/links to specific tasks won't work
- Consider adding "Skip import" option for fresh start
