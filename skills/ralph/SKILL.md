# Ralph PRD Converter

Convert PRDs to prd.json format for the Ralph autonomous agent system. Use when you have an existing PRD and need to convert it to Ralph's JSON format. Triggers on: convert this prd, turn this into ralph format, create prd.json from this, ralph json.

## The Job

Take a PRD (markdown file or text) and convert it to `spec/prd.json`.

## Output Format

```json
{
  "projectName": "[Project Name]",
  "branchName": "feature/[feature-name-kebab-case]",
  "description": "[Feature description from PRD title/intro]",
  "created": "YYYY-MM-DD",
  "userStories": [
    {
      "id": "US-001",
      "title": "[Story title]",
      "description": "As a [user], I want [feature] so that [benefit]",
      "acceptanceCriteria": [
        "Criterion 1",
        "Criterion 2",
        "npm run typecheck passes"
      ],
      "passes": false
    }
  ]
}
```

## Story Size: The Number One Rule

**Each story must be completable in ONE Ralph iteration (one context window).**

Ralph spawns a fresh AI instance per iteration with no memory of previous work. If a story is too big, the LLM runs out of context before finishing and produces broken code.

### Right-sized stories:

- Add a TypeScript type definition
- Add a utility function with tests
- Add a UI component to an existing page
- Update a component with new props
- Add a filter dropdown to a list

### Too big (split these):

- "Build the entire dashboard" → Split into: types, utils, UI components, filters
- "Add authentication" → Split into: types, hooks, login UI, session handling
- "Refactor the API" → Split into one story per module or pattern

**Rule of thumb:** If you cannot describe the change in 2-3 sentences, it is too big.

## Story Ordering: Dependencies First

Stories execute in priority order (by array position). Earlier stories must not depend on later ones.

**Correct order:**

1. Type definitions (interfaces, types)
2. Utility functions and helpers
3. UI components that use the utilities
4. Integration into existing components
5. Tests and documentation

**Wrong order:**

1. UI component (depends on types that don't exist yet)
2. Type definitions

## Acceptance Criteria: Must Be Verifiable

Each criterion must be something Ralph can CHECK, not something vague.

### Good criteria (verifiable):

- "Create Priority type: 'high' | 'medium' | 'low' in src/types/index.ts"
- "Filter dropdown has options: All, High, Medium, Low"
- "Clicking delete shows confirmation dialog"
- "npm run typecheck passes"
- "npm run test passes"

### Bad criteria (vague):

- "Works correctly"
- "User can do X easily"
- "Good UX"
- "Handles edge cases"

### Always include as final criterion:

```
"npm run typecheck passes"
```

For stories with testable logic, also include:

```
"npm run test passes"
```

### For stories that change UI, also include:

```
"Verify in browser"
```

## Conversion Rules

1. **Each user story becomes one JSON entry**
2. **IDs**: Sequential (US-001, US-002, etc.)
3. **Order**: Based on dependency order, then document order
4. **All stories**: `passes: false`
5. **branchName**: Derive from feature name, kebab-case, prefixed with `feature/`
6. **Always add**: "npm run typecheck passes" to every story's acceptance criteria

## Splitting Large PRDs

If a PRD has big features, split them:

**Original:**

> "Add user notification system"

**Split into:**

1. US-001: Add Notification type to src/types/index.ts
2. US-002: Create notification utility functions
3. US-003: Add notification bell icon component
4. US-004: Create notification dropdown panel
5. US-005: Add mark-as-read functionality
6. US-006: Add notification preferences component

Each is one focused change that can be completed and verified independently.

## Example

**Input PRD:**

```markdown
# Task Status Feature

Add ability to mark tasks with different statuses.

## Requirements

- Toggle between pending/in-progress/done on task list
- Filter list by status
- Show status badge on each task
```

**Output spec/prd.json:**

```json
{
  "projectName": "Task Status Feature",
  "branchName": "feature/task-status",
  "description": "Track task progress with status indicators and filtering",
  "created": "2026-01-23",
  "userStories": [
    {
      "id": "US-001",
      "title": "Add Status type to Task interface",
      "description": "As a developer, I need to define task status types for type safety.",
      "acceptanceCriteria": [
        "Create Status type: 'pending' | 'in_progress' | 'done' in src/types/index.ts",
        "Add optional status field to Task interface with default 'pending'",
        "npm run typecheck passes"
      ],
      "passes": false
    },
    {
      "id": "US-002",
      "title": "Create StatusBadge component",
      "description": "As a user, I want to see task status at a glance.",
      "acceptanceCriteria": [
        "Create src/components/StatusBadge.tsx",
        "Props: status: Status, size?: 'sm' | 'md'",
        "Badge colors: gray=pending, blue=in_progress, green=done",
        "npm run typecheck passes",
        "Verify in browser"
      ],
      "passes": false
    },
    {
      "id": "US-003",
      "title": "Add status toggle to TaskCard",
      "description": "As a user, I want to change task status directly from the card.",
      "acceptanceCriteria": [
        "Update TaskCard to show StatusBadge",
        "Add status dropdown or toggle control",
        "Changing status updates immediately",
        "npm run typecheck passes",
        "Verify in browser"
      ],
      "passes": false
    },
    {
      "id": "US-004",
      "title": "Create StatusFilter component",
      "description": "As a user, I want to filter the list to see only certain statuses.",
      "acceptanceCriteria": [
        "Create src/components/StatusFilter.tsx",
        "Filter options: All | Pending | In Progress | Done",
        "Active filter is visually highlighted",
        "npm run typecheck passes"
      ],
      "passes": false
    },
    {
      "id": "US-005",
      "title": "Integrate StatusFilter into TaskList",
      "description": "As a user, I want the task list to respond to my filter selection.",
      "acceptanceCriteria": [
        "Update TaskList to use StatusFilter",
        "Filter component appears above task list",
        "Selecting a filter shows only matching tasks",
        "npm run typecheck passes",
        "Verify in browser"
      ],
      "passes": false
    }
  ]
}
```

## Archiving Previous Runs

**Before writing a new prd.json, check if there is an existing one from a different feature:**

1. Read the current `spec/prd.json` if it exists
2. Check if `branchName` differs from the new feature's branch name
3. If different AND `spec/progress.txt` has content beyond the header:
   - Create archive folder: `scripts/ralph/archive/YYYY-MM-DD-feature-name/`
   - Copy current `spec/prd.json` and `spec/progress.txt` to archive
   - Reset `spec/progress.txt` with fresh header

**The ralph.sh script handles this automatically** when you run it, but if you are manually updating prd.json between runs, archive first.

## Checklist Before Saving

Before writing prd.json, verify:

- [ ] **Previous run archived** (if prd.json exists with different branchName)
- [ ] Each story is completable in one iteration (small enough)
- [ ] Stories are ordered by dependency (types → utils → UI → integration)
- [ ] Every story has "npm run typecheck passes" as criterion
- [ ] UI stories have "Verify in browser" as criterion
- [ ] Acceptance criteria are verifiable (not vague)
- [ ] No story depends on a later story
