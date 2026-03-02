# Subtask Enhancements Implementation Plan

## Overview
Implement two subtask enhancements:
1. **Add subtasks at task creation** - Allow adding subtasks in the TaskInput form
2. **Enhanced subtask properties** - Add priority and due date to subtasks

---

## Phase 1: Type Definitions

### File: `src/types/index.ts`
Update the `Subtask` interface (backwards compatible):
```typescript
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  // Enhanced properties (optional for backwards compatibility)
  dueDate?: Date;
  priority?: Priority;
}
```

---

## Phase 2: Subtasks at Task Creation

### File: `src/hooks/useTaskForm.ts`
Add subtask state management:
- State: `subtasks`, `showSubtasks`, `newSubtaskTitle`
- Actions: `addSubtask`, `removeSubtask`
- Validation: Enforce max 10 subtasks per task
- Update `resetForm` to clear subtasks
- Update `handleSubmit` to include subtasks in callback

### File: `src/components/TaskInput.tsx`
- Update `TaskInputProps.onAddTask` signature to accept `subtasks?: Subtask[]`
- Add "Subtasks" toggle button (using `ListTodo` icon from lucide-react)
- Add collapsible section with:
  - List of added subtasks with remove buttons
  - Input field + add button for new subtasks
  - Counter showing "X/10 subtasks" when approaching limit
- **Simple list approach**: Title-only entry at creation; priority/due date set after task exists

### File: `src/components/MainLayout.tsx`
- Update `handleAddTask` callback signature to accept `subtasks`
- Pass subtasks to `addTask` call

---

## Phase 3: Enhanced Subtask Properties

### File: `src/components/SubtaskList.tsx`
Enhance the subtask display and editing:

**For each subtask row:**
- Priority dot indicator (when priority is set)
- Due date badge (when due date is set)
- **Overdue styling**: Due date shown in red when overdue

**Hover actions (like existing delete button):**
- Priority picker appears on hover (3 colored dots)
- Due date picker appears on hover (calendar icon that opens DatePicker)
- Delete button (already exists)

**Date validation:**
- Subtask due date cannot be set after parent task's due date
- If parent has no due date, subtask due dates are unrestricted
- Disable dates after parent due date in the DatePicker

---

## Phase 4: Parent Task Completion Behavior

### File: `src/hooks/useTasks.tsx`
Update `toggleComplete` to auto-complete subtasks:
- When parent task is marked complete, set all subtasks to `completed: true`
- When parent task is marked incomplete, leave subtasks as-is (user can uncheck manually)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `dueDate?` and `priority?` to Subtask |
| `src/hooks/useTaskForm.ts` | Add subtasks state, actions, 10 subtask limit |
| `src/components/TaskInput.tsx` | Add subtasks toggle + collapsible section |
| `src/components/MainLayout.tsx` | Update callback signature |
| `src/components/SubtaskList.tsx` | Hover actions for priority/date, overdue styling |
| `src/hooks/useTasks.tsx` | Auto-complete subtasks when parent completes |

---

## UI Design

### TaskInput - Subtasks Section (Simple List)
```
[+] Add a new task...          [●●●] Categories Deadline Note Subtasks
─────────────────────────────────────────────────────────────────
○ Buy groceries                                              [x]
○ Call dentist                                               [x]
[___Add subtask..._____] [+]                           2/10 added
```
- Title-only entry for quick subtask creation
- Remove button on each subtask
- Show count when 5+ subtasks (approaching limit)

### SubtaskList - Hover Actions
```
Default view:
○ ● Subtask title                                    Jan 30  [x]
    ↑ priority dot (if set)                          ↑ due date (red if overdue)

On hover:
○ ● Subtask title                    [●●●] [📅]      Jan 30  [x]
                                     ↑ priority ↑ date picker
```
- Priority and date controls appear on hover (same pattern as delete button)
- Due date shown in red text when overdue
- Popovers or inline pickers for editing

---

## Edge Cases & Validation

| Scenario | Behavior |
|----------|----------|
| **Subtask limit** | Hard limit of 10 subtasks per task. Disable add button at limit. |
| **Due date validation** | Subtask due date cannot exceed parent task due date. Disabled in picker. |
| **Parent completion** | Auto-complete all subtasks when parent is marked complete. |
| **Backwards compatibility** | Existing subtasks without priority/dueDate render normally (no dot, no date). |
| **Empty states** | Show input immediately when subtasks section expanded. |
| **Form reset** | Escape clears all pending subtasks in TaskInput. |
| **Overdue display** | Due date text turns red, matching existing overdue task styling. |
| **No parent due date** | Subtask due dates are unrestricted when parent has no due date. |
| **Mobile** | Hover actions become always-visible icons on touch devices. |

---

## Implementation Order

1. Update `Subtask` interface in `types/index.ts`
2. Update `useTaskForm.ts` with subtask state, actions, and 10-limit validation
3. Update `TaskInput.tsx` with subtasks UI (simple list approach)
4. Update `MainLayout.tsx` callback signature
5. Enhance `SubtaskList.tsx` with hover actions for priority/date and overdue styling
6. Update `useTasks.tsx` to auto-complete subtasks when parent completes

---

## Verification

1. **Create task with subtasks**: Add a task with 3 subtasks, verify they persist
2. **Subtask limit**: Try to add 11th subtask, verify it's blocked
3. **Edit subtask properties**: Hover to set priority and due date on existing subtask
4. **Date validation**: Set parent due date to Jan 30, verify subtask can't be set to Jan 31
5. **Overdue styling**: Set subtask due date to yesterday, verify red styling
6. **Parent completion**: Mark parent complete, verify all subtasks auto-complete
7. **Backwards compatibility**: Verify existing tasks/subtasks still display correctly
8. **Mobile**: Test on small viewport, verify hover actions are accessible
9. **Run tests**: `npm test`
