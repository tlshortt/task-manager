# PRD: Cleanup and Description UI

## Introduction
Remove unused time tracking code and add task description input/display so the UI is cleaner and notes are supported.

## Goals
- Remove dead time tracking fields, components, and utilities
- Keep tests and typecheck clean after cleanup
- Add a collapsed description input and inline description editing

## User Stories

### US-001: Remove time fields from Task type

**Description:** As a developer, I want to remove unused time fields from the Task type so the model matches the current UI.

**Acceptance Criteria:**
- [ ] Remove `estimatedMinutes` and `consumedMinutes` from Task interface in `src/types/index.ts`
- [ ] npm run typecheck passes

### US-002: Delete unused time components and exports

**Description:** As a developer, I want to delete unused time components and exports to reduce dead code.

**Acceptance Criteria:**
- [ ] Delete `src/components/ProgressBar.tsx`
- [ ] Delete `src/components/TimeDisplay.tsx`
- [ ] Delete `src/components/TimeDisplay.test.tsx`
- [ ] Delete `src/components/TaskSkeleton.tsx`
- [ ] Delete `src/components/TaskTableHeader.tsx`
- [ ] Remove exports for deleted components from `src/components/index.ts`
- [ ] npm run typecheck passes
- [ ] npm run test passes

### US-003: Remove time utilities and tests

**Description:** As a developer, I want to remove time helper utilities and their tests that are no longer used.

**Acceptance Criteria:**
- [ ] Remove `formatTime` and `parseTime` from `src/utils/dateUtils.ts`
- [ ] Remove `formatTime`/`parseTime` tests from `src/utils/dateUtils.test.ts`
- [ ] npm run typecheck passes
- [ ] npm run test passes

### US-004: Remove time fields from MainLayout task creation

**Description:** As a developer, I want MainLayout to stop setting time fields when creating tasks.

**Acceptance Criteria:**
- [ ] Remove `estimatedMinutes` and `consumedMinutes` from task creation payload in `src/components/MainLayout.tsx`
- [ ] npm run typecheck passes

### US-005: Update TaskRow tests for cleanup

**Description:** As a developer, I want TaskRow tests updated so they no longer expect time fields or displays.

**Acceptance Criteria:**
- [ ] Remove `estimatedMinutes` and `consumedMinutes` from TaskRow test fixtures
- [ ] Remove time-display assertions from `src/components/TaskRow.test.tsx`
- [ ] npm run typecheck passes
- [ ] npm run test passes

### US-006: Add collapsed description input in TaskInput

**Description:** As a user, I want a collapsed description input so I can add notes when needed without clutter.

**Acceptance Criteria:**
- [ ] Add description state and textarea in `src/components/TaskInput.tsx`
- [ ] Textarea is hidden by default and revealed by an "Add note" control
- [ ] `onAddTask` includes `description` when provided
- [ ] npm run typecheck passes
- [ ] Verify in browser

### US-007: Wire description into MainLayout addTask

**Description:** As a developer, I want MainLayout to pass description values into addTask.

**Acceptance Criteria:**
- [ ] Update MainLayout `handleAddTask` to accept `description`
- [ ] Pass `description` to `addTask` call in `src/components/MainLayout.tsx`
- [ ] npm run typecheck passes

### US-008: Display and edit description inline in TaskRow

**Description:** As a user, I want to view and edit a task description inline so notes are easy to update.

**Acceptance Criteria:**
- [ ] Show description text under title in `src/components/TaskRow.tsx`
- [ ] Empty description shows placeholder "Add a note..."
- [ ] Clicking description enters inline textarea edit mode
- [ ] Save on Enter or blur updates task description via `onUpdate`
- [ ] npm run typecheck passes
- [ ] Verify in browser

### US-009: Add tests for description UI

**Description:** As a developer, I want tests that cover description input and editing behavior.

**Acceptance Criteria:**
- [ ] `TaskInput` tests cover description toggle and submit payload
- [ ] `TaskRow` tests cover description display and edit behavior
- [ ] npm run typecheck passes
- [ ] npm run test passes

## Functional Requirements
1. FR-1: The Task type must not include `estimatedMinutes` or `consumedMinutes`.
2. FR-2: Time-related components and their tests must be removed and no longer exported.
3. FR-3: Time parsing/format utilities and tests must be removed.
4. FR-4: Task creation must not set time fields in MainLayout.
5. FR-5: TaskInput must support a collapsed description textarea.
6. FR-6: TaskRow must display and allow inline editing of description.
7. FR-7: Tests must be updated to reflect cleanup and description behavior.

## Non-Goals
- Replacing time tracking with a new tracking system
- Adding rich-text formatting for descriptions
- Persisting description draft state across sessions

## Design Considerations
- Use existing TaskRow typography and spacing for description text
- Keep description UI muted and unobtrusive under the title

## Technical Considerations
- Keep changes aligned with existing hook patterns and component structure
- Ensure no unused imports remain after deletions

## Success Metrics
- No time-related code remains in the UI or types
- Users can add and edit a description with minimal clicks
- Tests and typecheck pass after cleanup

## Open Questions
- Should we also remove exports for `filterTasks` and `searchTasks` in `src/utils/filters.ts`?
