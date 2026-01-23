# PRD: Styled To-Do List Application

## Introduction

Build a clean to-do list application focused on visual polish. Inspired by the Think201 Task Tracking design's middle section. Features rounded cards, subtle shadows, clean typography hierarchy, progress indicators, time tracking display. No sidebars—centered single-column layout.

## Design Reference

Based on: https://dribbble.com/shots/23623559-Task-Tracking-Productivity-App

**Focus: Middle section styling only**

**Visual Style:**

- Rounded corners (xl) on cards and buttons
- Subtle shadows for depth (shadow-card)
- Clean typography with clear hierarchy
- Progress indicators for time tracking
- Smooth transitions and hover states

**Color Palette:**

- Background: Clean white (#ffffff) / light gray (#f9fafb)
- Cards: White with subtle shadow
- Primary accent: Purple (#8b5cf6) for active states, checkmarks
- Secondary accent: Blue (#3b82f6) for progress bars
- Text: Navy (#0f172a) for headings, gray-600 for body, gray-400 for secondary
- Priority: Red (high), Amber (medium), Gray (low)

## Goals

- Persist tasks locally using IndexedDB (survives page refresh)
- Centered single-column layout—no sidebars
- Full CRUD with inline task input
- Time tracking display (estimated vs consumed)
- Visual progress bars on tasks
- Task priorities with color-coded dots
- Group tasks by date (Today, Tomorrow, future dates)
- Tab-based filtering (Current, Overdue, Completed)
- Dark mode with system preference detection
- Undo for delete and complete actions
- Skeleton loading states during data fetch
- Focus on visual polish: rounded corners, shadows, clean typography

## User Stories

### US-001: Install Dependencies

**Description:** As a developer, I need the required npm packages installed.

**Acceptance Criteria:**

- [ ] Run `npm install dexie date-fns react-hot-toast` successfully
- [ ] All three packages appear in package.json dependencies
- [ ] npm run typecheck passes

### US-002: Define Types

**Description:** As a developer, I need TypeScript types for type safety.

**Acceptance Criteria:**

- [ ] Create `Priority` type: `"low" | "medium" | "high"` in src/types/index.ts
- [ ] Create `FilterType` type: `"current" | "overdue" | "completed"`
- [ ] Create `Task` interface with: id?, title, description?, completed, priority, dueDate?, estimatedMinutes?, consumedMinutes?, createdAt, updatedAt
- [ ] npm run typecheck passes

### US-003: Create Dexie Database

**Description:** As a developer, I need IndexedDB for persistent storage.

**Acceptance Criteria:**

- [ ] Create src/db/index.ts with Dexie database
- [ ] Database name: "todoApp"
- [ ] Tables: tasks (auto-increment id)
- [ ] Task indexes: completed, priority, dueDate, createdAt
- [ ] Export db instance
- [ ] npm run typecheck passes

### US-004: Create useTasks Hook

**Description:** As a developer, I need a hook for task CRUD with undo.

**Acceptance Criteria:**

- [ ] Create src/hooks/useTasks.ts
- [ ] Returns: tasks, isLoading, addTask, updateTask, deleteTask, toggleComplete
- [ ] addTask creates with auto timestamps, default priority "medium"
- [ ] deleteTask shows toast with 5s Undo button
- [ ] toggleComplete shows toast with 5s Undo button
- [ ] Tasks update reactively via useLiveQuery
- [ ] npm run typecheck passes

### US-005: Configure Tailwind Theme

**Description:** As a developer, I need custom Tailwind config for the design system.

**Acceptance Criteria:**

- [ ] Update tailwind.config.js with custom colors: navy-800 (#1e293b), navy-900 (#0f172a), purple-accent (#8b5cf6), blue-accent (#3b82f6)
- [ ] Add custom shadow: shadow-card (0 2px 8px rgba(0,0,0,0.08))
- [ ] Add custom border-radius if needed
- [ ] npm run typecheck passes

### US-006: Create TaskTableHeader Component

**Description:** As a user, I want column headers for the task table.

**Acceptance Criteria:**

- [ ] Create src/components/TaskTableHeader.tsx
- [ ] Columns: Task (flex-1), Estimated (w-28), Consumed (w-28), Status (w-24)
- [ ] Sticky header, bg-gray-50/80 backdrop-blur
- [ ] text-xs uppercase text-gray-500 font-medium tracking-wide
- [ ] Rounded-t-xl on first render, border-b border-gray-100
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes

### US-007: Create TaskRow Component

**Description:** As a user, I want task rows with clean design.

**Acceptance Criteria:**

- [ ] Create src/components/TaskRow.tsx
- [ ] Props: task, onToggle, onUpdate, onDelete
- [ ] Layout: checkbox, priority dot, title, estimated time, consumed time, action icons
- [ ] Checkbox: rounded-md border-2 border-gray-300, checked=bg-purple-600 with checkmark
- [ ] Time format: 1hr 30m (compact)
- [ ] Action icons: play, check, trash on hover (opacity-0 group-hover:opacity-100)
- [ ] Completed: line-through, text-gray-400
- [ ] Hover: bg-gray-50 transition-colors
- [ ] py-4 px-4 border-b border-gray-100 last:border-b-0
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes
- [ ] Verify in browser

### US-008: Create TaskDateGroup Component

**Description:** As a user, I want tasks grouped by date with clean headers.

**Acceptance Criteria:**

- [ ] Create src/components/TaskDateGroup.tsx
- [ ] Props: label, count, tasks, onToggle, onUpdate, onDelete
- [ ] Header: TODAY (4) format in text-xs font-semibold text-gray-500 uppercase tracking-wider
- [ ] Renders TaskRow for each task inside white card
- [ ] Card wrapper: bg-white rounded-xl shadow-card
- [ ] Collapsible with chevron icon, smooth transition
- [ ] mb-6 spacing between groups
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes
- [ ] Verify in browser

### US-009: Create TaskInput Component

**Description:** As a user, I want inline task input with modern styling.

**Acceptance Criteria:**

- [ ] Create src/components/TaskInput.tsx
- [ ] bg-white rounded-xl shadow-card p-4
- [ ] Plus icon (text-purple-600) + input field + Set deadline button
- [ ] Input: border-0 focus:ring-0, placeholder text-gray-400
- [ ] Deadline button: text-sm text-gray-500 hover:text-purple-600, calendar icon
- [ ] Enter submits and clears input
- [ ] Date picker appears on deadline click
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes
- [ ] Verify in browser

### US-010: Create FilterTabs Component

**Description:** As a user, I want tab filters with active state styling.

**Acceptance Criteria:**

- [ ] Create src/components/FilterTabs.tsx
- [ ] Props: filter, onFilterChange, counts
- [ ] Tabs: Current, Overdue, Completed
- [ ] Active: font-medium text-navy-900 border-b-2 border-purple-600 pb-2
- [ ] Inactive: text-gray-500 hover:text-gray-700
- [ ] Horizontal flex gap-8
- [ ] Count badge: bg-gray-100 rounded-full px-2 text-xs ml-2
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes
- [ ] Verify in browser

### US-011: Create PriorityBadge Component

**Description:** As a user, I want colored priority indicators.

**Acceptance Criteria:**

- [ ] Create src/components/PriorityBadge.tsx
- [ ] Props: priority: Priority
- [ ] Colored dot: high=bg-red-500, medium=bg-amber-500, low=bg-gray-400
- [ ] w-2 h-2 rounded-full inline-block mr-2
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes

### US-012: Create TimeDisplay Component

**Description:** As a user, I want formatted time display.

**Acceptance Criteria:**

- [ ] Create src/components/TimeDisplay.tsx
- [ ] Props: minutes: number, variant?: 'default' | 'consumed'
- [ ] Format: 1hr 30m, 45m, 2hr, -- if zero/undefined
- [ ] default: text-gray-600, consumed: text-purple-600 font-medium
- [ ] text-sm tabular-nums
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes

### US-013: Create ProgressBar Component

**Description:** As a user, I want visual progress on time-tracked tasks.

**Acceptance Criteria:**

- [ ] Create src/components/ProgressBar.tsx
- [ ] Props: consumed: number, estimated: number
- [ ] Show percentage bar: bg-gray-200 rounded-full h-1.5
- [ ] Fill: bg-gradient-to-r from-purple-500 to-blue-500
- [ ] If consumed > estimated: fill becomes bg-red-500
- [ ] Width: calculated as (consumed/estimated)*100, max 100%
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes

### US-014: Create Date Utilities

**Description:** As a developer, I need date helper functions.

**Acceptance Criteria:**

- [ ] Create src/utils/dateUtils.ts
- [ ] groupTasksByDate(tasks): returns Map<string, Task[]> with keys "today", "tomorrow", date strings
- [ ] formatDateLabel(date): returns "TODAY", "TOMORROW", "MON 29 JAN"
- [ ] isOverdue(task): dueDate < today and not completed
- [ ] formatTime(minutes): returns "1hr 30m" format (compact)
- [ ] Uses date-fns
- [ ] npm run typecheck passes

### US-015: Create Filter Utilities

**Description:** As a developer, I need filter functions.

**Acceptance Criteria:**

- [ ] Create src/utils/filters.ts
- [ ] filterTasks(tasks, filter): applies Current/Overdue/Completed logic
- [ ] Current = not completed, not overdue
- [ ] Overdue = dueDate past, not completed
- [ ] Completed = completed
- [ ] getFilterCounts(tasks): returns counts for each filter
- [ ] npm run typecheck passes

### US-016: Configure Toast Notifications

**Description:** As a user, I want action feedback with undo.

**Acceptance Criteria:**

- [ ] Add Toaster from react-hot-toast to App.tsx
- [ ] Position: bottom-center
- [ ] Toast style: bg-navy-900 text-white rounded-xl shadow-lg
- [ ] Undo button: text-purple-400 hover:text-purple-300
- [ ] Duration: 5000ms
- [ ] npm run typecheck passes
- [ ] Verify in browser

### US-017: Create AppHeader Component

**Description:** As a user, I want a clean header with title and controls.

**Acceptance Criteria:**

- [ ] Create src/components/AppHeader.tsx
- [ ] Left: App title 'Tasks' in text-2xl font-bold text-navy-900
- [ ] Right: Today's date in text-gray-500, dark mode toggle button
- [ ] py-6 mb-2
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes
- [ ] Verify in browser

### US-018: Create useDarkMode Hook

**Description:** As a user, I want dark mode toggle.

**Acceptance Criteria:**

- [ ] Create src/hooks/useDarkMode.ts
- [ ] Returns { isDark, toggle }
- [ ] Reads localStorage "darkMode" on mount
- [ ] Falls back to prefers-color-scheme
- [ ] Toggles "dark" class on documentElement
- [ ] npm run typecheck passes

### US-019: Create MainLayout Component

**Description:** As a user, I want centered content with proper spacing.

**Acceptance Criteria:**

- [ ] Create src/components/MainLayout.tsx
- [ ] Centered: max-w-4xl mx-auto px-6
- [ ] bg-gray-50 dark:bg-slate-900 min-h-screen
- [ ] Contains: AppHeader, FilterTabs, TaskInput, TaskDateGroups
- [ ] Smooth transitions on dark mode toggle
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes
- [ ] Verify in browser

### US-020: Integrate App with MainLayout

**Description:** As a user, I want the complete app working.

**Acceptance Criteria:**

- [ ] App.tsx renders MainLayout
- [ ] useTasks hook provides data and handlers
- [ ] Filter state in App, passed to FilterTabs and used to filter tasks
- [ ] Toaster rendered for notifications
- [ ] Dark mode toggle in header
- [ ] npm run typecheck passes
- [ ] Verify full CRUD flow in browser

### US-021: Create TaskSkeleton Component

**Description:** As a user, I want loading placeholders.

**Acceptance Criteria:**

- [ ] Create src/components/TaskSkeleton.tsx
- [ ] Matches TaskRow dimensions
- [ ] animate-pulse bg-gray-200 dark:bg-gray-700 rounded
- [ ] Props: count (default 3)
- [ ] Skeleton card wrapper matches TaskDateGroup card style
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes

### US-022: Create EmptyState Component

**Description:** As a user, I want a friendly empty state.

**Acceptance Criteria:**

- [ ] Create src/components/EmptyState.tsx
- [ ] Props: filter (to show context-aware message)
- [ ] Illustration or icon placeholder
- [ ] Message: "No tasks yet" / "No overdue tasks" / etc
- [ ] Centered, text-gray-500, py-12
- [ ] Exported from src/components/index.ts
- [ ] npm run typecheck passes

### US-023: Write Utility Tests

**Description:** As a developer, I need utility tests.

**Acceptance Criteria:**

- [ ] Create src/utils/dateUtils.test.ts
- [ ] Create src/utils/filters.test.ts
- [ ] Test groupTasksByDate, formatDateLabel, isOverdue, formatTime
- [ ] Test filterTasks for each filter type
- [ ] npm run test passes

### US-024: Write Component Tests

**Description:** As a developer, I need component tests.

**Acceptance Criteria:**

- [ ] Create src/components/TaskRow.test.tsx
- [ ] Create src/components/FilterTabs.test.tsx
- [ ] Test render, interactions, handlers called
- [ ] npm run test passes

### US-025: Polish and Accessibility

**Description:** As a user, I want a polished, accessible experience.

**Acceptance Criteria:**

- [ ] All interactive elements have aria-labels
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus states: ring-2 ring-purple-500 ring-offset-2
- [ ] Mobile: touch targets min 44px
- [ ] All components have dark: variants
- [ ] Hover states use transition-colors duration-150
- [ ] npm run typecheck passes
- [ ] Verify in browser at 375px, 768px, 1280px

## Functional Requirements

- FR-1: Tasks persist in IndexedDB across refresh
- FR-2: Centered single-column layout (no sidebars)
- FR-3: Tasks displayed in table format with time columns
- FR-4: Tasks grouped by date with collapsible sections
- FR-5: Tab filtering: Current, Overdue, Completed
- FR-6: Inline task creation with deadline picker
- FR-7: Task completion with undo toast
- FR-8: Task deletion with undo
- FR-9: Dark mode toggle with persistence
- FR-10: Responsive layout for mobile/tablet/desktop
- FR-11: Skeleton loading during data fetch
- FR-12: Progress bars on time-tracked tasks

## Non-Goals

- No sidebars (left or right)
- No actual time tracking timer (display only)
- No drag-and-drop reordering
- No team/assignee functionality
- No productivity charts
- No cloud sync

## Technical Considerations

- Tailwind CSS for all styling (no custom CSS files)
- Dexie.js for IndexedDB with useLiveQuery
- date-fns for date operations
- react-hot-toast for notifications
- Mobile-first responsive design

## Color Palette (Tailwind)

**Light Mode:**

- Background: bg-gray-50 (#f9fafb)
- Cards: bg-white shadow-card
- Primary accent: purple-600 (#9333ea) / purple-500 (#8b5cf6)
- Secondary accent: blue-500 (#3b82f6)
- Text primary: text-slate-900 / navy-900 (#0f172a)
- Text secondary: text-gray-600
- Text muted: text-gray-400
- Borders: border-gray-100

**Dark Mode:**

- Background: bg-slate-900
- Cards: bg-slate-800 shadow-lg
- Text primary: text-gray-100
- Text secondary: text-gray-400
- Borders: border-slate-700

**Priority Colors:**

- High: bg-red-500
- Medium: bg-amber-500
- Low: bg-gray-400

## Success Metrics

- Tasks persist across refresh
- All CRUD operations work with undo
- Responsive at 375px, 768px, 1280px
- Dark mode applies to all components
- Tests pass
- Visual polish: rounded corners, shadows, clean typography throughout
