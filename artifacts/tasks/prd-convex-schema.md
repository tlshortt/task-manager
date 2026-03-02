# PRD: Convex Schema Definition

## Introduction

Define Convex schema matching current Task/Category TypeScript types. This enables type-safe database operations and prepares for data migration from Dexie to Convex.

## Goals

- Create `convex/schema.ts` with tables for tasks and categories
- Match existing TypeScript types (Task, Category, Priority, Recurrence)
- Define appropriate indexes for common queries
- Validate schema with automated tests

## User Stories

### US-001: Create Convex Schema File

**Description:** As an AI agent, I need to create the Convex schema file so the database structure matches our TypeScript types.

**Acceptance Criteria:**

- [ ] Create `convex/schema.ts` with `defineSchema` and `defineTable`
- [ ] Define `categories` table with `name` (string) and `color` (string)
- [ ] Define `tasks` table with all required fields (title, description, completed, priority, dueDateMs, subtasks, categoryIds, createdAtMs, updatedAtMs, recurrence fields)
- [ ] Priority uses `v.union` with literals: 'low', 'medium', 'high'
- [ ] Subtasks defined as embedded array of objects
- [ ] Recurrence object matches existing Recurrence type
- [ ] Dates stored as milliseconds (number), not Date objects
- [ ] `categoryIds` references `Id<"categories">[]` (normalized)
- [ ] npm run typecheck passes

### US-002: Add Database Indexes

**Description:** As an AI agent, I need to add indexes for efficient querying of common access patterns.

**Acceptance Criteria:**

- [ ] `categories` table has index `by_name` on `['name']`
- [ ] `tasks` table has index `by_completed` on `['completed']`
- [ ] `tasks` table has index `by_dueDateMs` on `['dueDateMs']`
- [ ] `tasks` table has index `by_recurringParentId` on `['recurringParentId']`
- [ ] `tasks` table has index `by_isRecurringParent` on `['isRecurringParent']`
- [ ] npm run typecheck passes

### US-003: Add Schema Validation Tests

**Description:** As an AI agent, I need automated tests to validate the schema structure is correct.

**Acceptance Criteria:**

- [ ] Create `convex/schema.test.ts`
- [ ] Test that schema exports default defineSchema result
- [ ] Test that `tasks` and `categories` tables are defined
- [ ] Test that required fields exist on each table
- [ ] Test that indexes are defined
- [ ] npm run test passes

## Functional Requirements

- FR-1: Schema file must be at `convex/schema.ts`
- FR-2: Use Convex validators (`v.string()`, `v.number()`, `v.boolean()`, etc.)
- FR-3: All optional fields use `v.optional()`
- FR-4: Priority type: `v.union(v.literal('low'), v.literal('medium'), v.literal('high'))`
- FR-5: Recurrence frequency: `v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly'), v.literal('yearly'))`
- FR-6: Subtask embedded as `v.array(v.object({...}))`
- FR-7: Category references use `v.id('categories')` for type-safe foreign keys

## Non-Goals

- No data migration in this phase
- No mutation/query functions yet
- No rollback procedures
- No dashboard verification (manual step)

## Technical Considerations

- Reference existing types in `src/types/index.ts` for field mapping
- Dexie uses `Date` objects; Convex uses milliseconds (`number`)
- Dexie uses `id?: number`; Convex auto-generates `_id: Id<"table">`
- Dexie embeds full `Category[]`; Convex normalizes to `categoryIds: Id<"categories">[]`

## Success Metrics

- Schema file created without errors
- All tests pass
- `npx convex dev` can push schema (verified in subsequent phase)

## Open Questions

None - schema structure is fully defined in Phase 2 plan.
