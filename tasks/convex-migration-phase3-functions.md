# Phase 3: Convex Functions

## Overview
Implement Convex queries and mutations to replace Dexie operations.

**Estimated time:** ~3-4 hours

## Tasks

### 3.1 Create Tasks Query (`convex/tasks.ts`)

```ts
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('tasks').collect();
  },
});
```

### 3.2 Create Task Mutations

```ts
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
    dueDateMs: v.optional(v.number()),
    subtasks: v.optional(v.array(/* subtask validator */)),
    tagIds: v.optional(v.array(v.id('tags'))),
    recurrence: v.optional(/* recurrence validator */),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Handle recurring task creation
    if (args.recurrence) {
      const parentId = await ctx.db.insert('tasks', {
        ...args,
        createdAtMs: now,
        updatedAtMs: now,
        isRecurringParent: true,
      });
      
      // Generate instances (import shared util)
      // await generateAndInsertInstances(ctx, parentId, args);
      
      return parentId;
    }
    
    return await ctx.db.insert('tasks', {
      ...args,
      createdAtMs: now,
      updatedAtMs: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('tasks'),
    // ... partial task fields
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAtMs: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    await ctx.db.delete(args.id);
    return task; // Return for undo
  },
});

export const toggleComplete = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error('Task not found');
    
    const newCompleted = !task.completed;
    await ctx.db.patch(args.id, {
      completed: newCompleted,
      updatedAtMs: Date.now(),
    });
    
    return { oldCompleted: task.completed };
  },
});
```

### 3.3 Recurring Task Mutations

```ts
export const deleteSeries = mutation({
  args: { parentId: v.id('tasks') },
  handler: async (ctx, args) => {
    // Delete all instances
    const instances = await ctx.db
      .query('tasks')
      .withIndex('by_recurringParentId', (q) => q.eq('recurringParentId', args.parentId))
      .collect();
    
    for (const instance of instances) {
      await ctx.db.delete(instance._id);
    }
    
    // Delete parent
    await ctx.db.delete(args.parentId);
  },
});

export const updateSeries = mutation({
  args: {
    parentId: v.id('tasks'),
    updates: v.object({ /* task fields */ }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Update parent
    await ctx.db.patch(args.parentId, {
      ...args.updates,
      updatedAtMs: now,
    });
    
    // Update future non-customized instances
    const instances = await ctx.db
      .query('tasks')
      .withIndex('by_recurringParentId', (q) => q.eq('recurringParentId', args.parentId))
      .collect();
    
    for (const instance of instances) {
      if (instance.instanceDateMs && instance.instanceDateMs >= now && !instance.isCustomized) {
        await ctx.db.patch(instance._id, {
          ...args.updates,
          updatedAtMs: now,
        });
      }
    }
  },
});

export const generateInstances = mutation({
  args: { parentId: v.id('tasks') },
  handler: async (ctx, args) => {
    // Import and use recurrence utils
    // Generate instances for lookahead window
  },
});
```

### 3.4 Create Tags Functions (`convex/tags.ts`)

```ts
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('tags').collect();
  },
});

export const create = mutation({
  args: { name: v.string(), color: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('tags', args);
  },
});

export const remove = mutation({
  args: { id: v.id('tags') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

### 3.5 Move Recurrence Utils to Shared Location
Move `src/utils/recurrenceUtils.ts` to work with timestamps:
- Replace `Date` objects with `number` (ms)
- Ensure no browser-only APIs
- Can be imported by Convex functions

## Function Mapping

| Dexie Operation | Convex Function |
|-----------------|-----------------|
| `db.tasks.toArray()` | `api.tasks.list` |
| `db.tasks.add()` | `api.tasks.create` |
| `db.tasks.update()` | `api.tasks.update` |
| `db.tasks.delete()` | `api.tasks.remove` |
| `db.tasks.get()` | implicit in mutations |
| `generateInstancesForParent()` | `api.tasks.generateInstances` |
| `deleteRecurringSeries()` | `api.tasks.deleteSeries` |
| `updateRecurringSeries()` | `api.tasks.updateSeries` |

## Acceptance Criteria
- [ ] `tasks.list` returns all tasks
- [ ] `tasks.create` handles regular and recurring tasks
- [ ] `tasks.update` patches task with timestamp
- [ ] `tasks.remove` returns deleted task for undo
- [ ] `tasks.toggleComplete` works with undo support
- [ ] Series mutations work correctly
- [ ] `tags.list/create/remove` work

## Dependencies
- Phase 2 complete (schema deployed)

## Notes
- Convex doesn't have `bulkAdd`; use loops (fine for <100 items)
- Mutations are transactional (all-or-nothing)
- Return values from mutations enable undo patterns
