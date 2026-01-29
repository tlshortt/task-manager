# Phase 2: Convex Schema

## Overview
Define Convex schema matching current Task/Tag types.

**Estimated time:** ~30 minutes

## Tasks

### 2.1 Create Schema File
Create `convex/schema.ts`:

```ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const priority = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high')
);

const subtask = v.object({
  id: v.string(),
  title: v.string(),
  completed: v.boolean(),
  priority: v.optional(priority),
  dueDateMs: v.optional(v.number()),
});

const recurrence = v.object({
  frequency: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly'),
    v.literal('yearly')
  ),
  interval: v.number(),
  daysOfWeek: v.optional(v.array(v.number())),
  dayOfMonth: v.optional(v.number()),
  endDateMs: v.optional(v.number()),
  count: v.optional(v.number()),
});

export default defineSchema({
  tags: defineTable({
    name: v.string(),
    color: v.string(),
  }).index('by_name', ['name']),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    priority,
    dueDateMs: v.optional(v.number()),

    subtasks: v.optional(v.array(subtask)),
    tagIds: v.optional(v.array(v.id('tags'))),

    createdAtMs: v.number(),
    updatedAtMs: v.number(),

    isRecurringParent: v.optional(v.boolean()),
    recurringParentId: v.optional(v.id('tasks')),
    recurrence: v.optional(recurrence),
    instanceDateMs: v.optional(v.number()),
    isCustomized: v.optional(v.boolean()),
  })
    .index('by_completed', ['completed'])
    .index('by_dueDateMs', ['dueDateMs'])
    .index('by_recurringParentId', ['recurringParentId'])
    .index('by_isRecurringParent', ['isRecurringParent']),
});
```

### 2.2 Verify Schema Deployment
- Save file while `npx convex dev` is running
- Check terminal for successful schema push
- Verify tables in Convex dashboard

## Key Differences from Dexie

| Dexie | Convex |
|-------|--------|
| `id?: number` | `_id: Id<"tasks">` (auto-generated) |
| `dueDate?: Date` | `dueDateMs?: number` (timestamp) |
| `createdAt: Date` | `createdAtMs: number` |
| `tags?: Tag[]` | `tagIds?: Id<"tags">[]` (normalized) |

## Acceptance Criteria
- [ ] Schema file created and valid
- [ ] `npx convex dev` pushes schema successfully
- [ ] Dashboard shows `tasks` and `tags` tables
- [ ] Indexes visible in dashboard

## Dependencies
- Phase 1 complete (Convex initialized)

## Notes
- Dates stored as milliseconds (`Date.now()` / `date.getTime()`)
- Subtasks embedded as array (not separate table)
- Tags normalized via `tagIds` reference
