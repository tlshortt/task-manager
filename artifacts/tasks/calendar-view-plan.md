# Calendar View Implementation Plan

## Overview
Add a monthly calendar view to visualize tasks by due date. Users toggle between List and Calendar views. Tasks without due dates are hidden in calendar view (visible in list view only).

## Architecture Decision
**Custom calendar component** (no library) because:
- date-fns already installed - no new dependencies
- Full control over Tailwind dark mode styling
- Lighter than react-big-calendar or fullcalendar
- Simpler requirements (monthly view, navigation, task display)

## New Files to Create

### 1. `src/components/ViewModeToggle.tsx`
Toggle button component (List | Calendar) with icons matching FilterTabs styling.

### 2. `src/components/calendar/CalendarView.tsx`
Main container managing:
- Current month state
- Selected date for modal
- Month navigation handlers
- Task grouping by date

### 3. `src/components/calendar/CalendarHeader.tsx`
Navigation: "< January 2026 >" with Today button.

### 4. `src/components/calendar/CalendarGrid.tsx`
7-column CSS grid with day-of-week headers (Sun-Sat) and 6 weeks of CalendarDay cells.

### 5. `src/components/calendar/CalendarDay.tsx`
Individual day cell showing:
- Date number (dimmed if not current month)
- Today highlight (purple ring)
- Task count badge
- Priority color dots
- Overdue indicator (red tint)
- Max 2-3 task previews, then "+N more"

### 6. `src/components/calendar/CalendarTaskItem.tsx`
Compact task: priority dot + truncated title, strikethrough if completed.

### 7. `src/components/calendar/DayTasksModal.tsx`
Modal showing all tasks for selected date using existing TaskRow component.

### 8. `src/utils/calendarUtils.ts`
```typescript
generateCalendarDays(month: Date, tasks: Task[]): CalendarDay[]
getTasksForDate(tasks: Task[], date: Date): Task[]
```

## Files to Modify

### `src/types/index.ts`
Add: `export type ViewMode = 'list' | 'calendar';`

### `src/components/MainLayout.tsx`
- Add `viewMode` state
- Render ViewModeToggle between FilterTabs and TaskInput
- Conditionally render list view or CalendarView
- Filter out tasks without dueDate for calendar view

### `src/components/index.ts`
Export new components.

## Implementation Sequence

| Step | Task |
|------|------|
| 1 | Add `ViewMode` type to types/index.ts |
| 2 | Create ViewModeToggle.tsx |
| 3 | Add viewMode state to MainLayout, render toggle |
| 4 | Create calendarUtils.ts with date generation |
| 5 | Create CalendarHeader.tsx with navigation |
| 6 | Create CalendarGrid.tsx with day headers |
| 7 | Create CalendarDay.tsx with task indicators |
| 8 | Create CalendarTaskItem.tsx |
| 9 | Create CalendarView.tsx assembling all pieces |
| 10 | Wire CalendarView into MainLayout |
| 11 | Create DayTasksModal.tsx |
| 12 | Add click handler to open modal from day cell |
| 13 | Add mobile responsive styles |
| 14 | Add tests for utilities and components |

## Key Interactions
- Click day cell: opens DayTasksModal with full task list
- Click task checkbox: toggles complete
- Navigate months: arrow buttons
- Jump to today: Today button
- Escape key: closes modal

## Mobile Responsiveness
- Compact grid with smaller cells
- Show count badges only (no task previews)
- Tap to open full-screen modal
- Touch-friendly navigation buttons

## Filter Behavior
Existing filters (Current/Overdue/Completed) apply to calendar:
- Only matching tasks shown in cells
- Empty cells when no tasks match filter

## Dependencies
None new. Uses existing: date-fns, lucide-react, Tailwind.

## Verification
1. Run `npm run dev` and toggle between List/Calendar views
2. Verify tasks appear on correct dates
3. Test month navigation (prev/next/today)
4. Click a date with tasks, verify modal opens with correct tasks
5. Toggle task complete from calendar, verify state updates
6. Apply filters, verify calendar updates
7. Test dark mode styling
8. Test on mobile viewport
9. Run `npm test` to verify all tests pass
