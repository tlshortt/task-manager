# React Best Practices Implementation Plan

## Overview
After analyzing the task-manager codebase against [Vercel Labs React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices), I've identified several optimization opportunities prioritized by impact.

## Summary of Findings

**Strengths:**
- Good TypeScript coverage and type safety
- Solid accessibility implementation (ARIA attributes, keyboard shortcuts)
- Clean component architecture with separation of concerns
- Effective use of custom hooks (useTasks, useDarkMode, useDebounce)

**Key Issues:**
1. **Bundle size**: Barrel imports from lucide-react bundle ALL icons (~500kb+)
2. **Re-render performance**: No memoization in MainLayout, causing unnecessary recalculations
3. **Array operations**: `getFilterCounts` filters the same array 3 times
4. **Event handlers**: Inline functions break referential equality, triggering child re-renders

---

## Critical Priority (Highest Impact)

### 1. Fix Lucide React Barrel Imports
**Impact:** 50-70% bundle size reduction (~400-600kb)

**Current Problem:**
```tsx
// 9 files import like this:
import { Check, Trash2, ChevronDown } from 'lucide-react';
```
This bundles ALL 1000+ icons instead of just the ones used.

**Solution:**
```tsx
// Direct imports for tree-shaking:
import { Check } from 'lucide-react/dist/esm/icons/check';
import { Trash2 } from 'lucide-react/dist/esm/icons/trash-2';
import { ChevronDown } from 'lucide-react/dist/esm/icons/chevron-down';
```

**Files to Update:**
- `src/components/TaskRow.tsx` (4 icons)
- `src/components/TaskInput.tsx` (4 icons)
- `src/components/SubtaskList.tsx` (3 icons)
- `src/components/EmptyState.tsx` (3 icons)
- `src/components/SearchBar.tsx` (2 icons)
- `src/components/AppHeader.tsx` (2 icons)
- `src/components/TaskDateGroup.tsx` (1 icon)
- `src/components/TagBadge.tsx` (1 icon)
- `src/components/KeyboardShortcutsModal.tsx` (1 icon)

### 2. Dynamic Import for Conditional Components
**Impact:** ~10-15kb bundle reduction, faster initial load

**Current:** `KeyboardShortcutsModal` and `EmptyState` are eagerly loaded even when not used.

**Solution:**
```tsx
// In MainLayout.tsx
import { lazy, Suspense } from 'react';

const KeyboardShortcutsModal = lazy(() => import('./KeyboardShortcutsModal'));
const EmptyState = lazy(() => import('./EmptyState'));

// Usage:
<Suspense fallback={null}>
  {showShortcuts && <KeyboardShortcutsModal ... />}
</Suspense>
```

---

## High Priority (Performance)

### 3. Add Memoization to MainLayout
**Impact:** Prevents expensive recalculations on every render

**Current Problem (lines 38-45):**
```tsx
// Recalculated on EVERY render, even when dependencies haven't changed
const filteredTasks = tasks ? filterAndSearchTasks(tasks, filter, debouncedSearchQuery) : [];
const counts = tasks ? getFilterCounts(tasks) : { current: 0, overdue: 0, completed: 0 };
const groupedTasks = groupTasksByDate(filteredTasks);
const sortedGroups = sortDateGroups(groupedTasks);
```

**Solution:**
```tsx
const filteredTasks = useMemo(
  () => tasks ? filterAndSearchTasks(tasks, filter, debouncedSearchQuery) : [],
  [tasks, filter, debouncedSearchQuery]
);

const counts = useMemo(
  () => tasks ? getFilterCounts(tasks) : { current: 0, overdue: 0, completed: 0 },
  [tasks]
);

const sortedGroups = useMemo(() => {
  const groupedTasks = groupTasksByDate(filteredTasks);
  return sortDateGroups(groupedTasks);
}, [filteredTasks]);
```

### 4. Optimize getFilterCounts (Single Pass)
**Impact:** 3x reduction in array filtering operations

**Current Problem (src/utils/filters.ts:35-39):**
```tsx
// Filters the entire array 3 separate times
return {
  current: filterTasks(tasks, 'current').length,
  overdue: filterTasks(tasks, 'overdue').length,
  completed: filterTasks(tasks, 'completed').length,
};
```

**Solution:**
```tsx
// Single pass with reduce
export function getFilterCounts(tasks: Task[]): {
  current: number;
  overdue: number;
  completed: number;
} {
  return tasks.reduce((acc, task) => {
    if (task.completed) {
      acc.completed++;
    } else if (isOverdue(task)) {
      acc.overdue++;
    } else {
      acc.current++;
    }
    return acc;
  }, { current: 0, overdue: 0, completed: 0 });
}
```

### 5. Memoize Event Handlers in MainLayout
**Impact:** Prevents child component re-renders

**Current Problem (lines 47-75):**
```tsx
// Creates NEW function references on every render
const handleToggle = async (task: Task) => { ... };
const handleUpdate = async (task: Task) => { ... };
const handleDelete = async (task: Task) => { ... };
```

**Solution:**
```tsx
const handleToggle = useCallback(async (task: Task) => {
  if (task.id) {
    await toggleComplete(task.id);
  }
}, [toggleComplete]);

const handleUpdate = useCallback(async (task: Task) => {
  if (task.id) {
    await updateTask(task.id, task);
  }
}, [updateTask]);

const handleDelete = useCallback(async (task: Task) => {
  if (task.id) {
    await deleteTask(task.id);
  }
}, [deleteTask]);
```

---

## Medium Priority

### 6. Hoist Static Functions in TaskRow
**Impact:** Prevents function recreation on every render

**Current Problem (src/components/TaskRow.tsx:17-26):**
```tsx
// Function declared inside component, recreated on every render
function getPriorityColor(priority: Task['priority']): string {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-amber-500';
    case 'low': return 'bg-gray-400';
  }
}
```

**Solution:**
```tsx
// Move to module level (before component)
const PRIORITY_COLORS: Record<Task['priority'], string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-gray-400',
} as const;

function getPriorityColor(priority: Task['priority']): string {
  return PRIORITY_COLORS[priority];
}
```

### 7. Fix useKeyboardShortcuts Dependencies
**Impact:** Prevents unnecessary event listener re-registration

**Current Problem (src/hooks/useKeyboardShortcuts.ts:52):**
```tsx
const handleKeyDown = useCallback(
  (e: KeyboardEvent) => { ... },
  [handlers]  // handlers object changes every render from MainLayout
);
```

**Solution:**
```tsx
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  // Destructure to track primitive dependencies
  const { onNewTask, onToggleHelp, onToggleDarkMode, onEscape, onSearch } = handlers;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { ... },
    [onNewTask, onToggleHelp, onToggleDarkMode, onEscape, onSearch]
  );

  // ... rest of hook
}
```

---

## Low Priority (Nice-to-Have)

### 8. Use .toSorted() for Immutable Sorting
**Current (src/utils/dateUtils.ts:71):**
```tsx
return Array.from(groups.entries()).sort(([keyA], [keyB]) => { ... });
```

**Better (if targeting ES2023+):**
```tsx
return Array.from(groups.entries()).toSorted(([keyA], [keyB]) => { ... });
```

### 9. Add content-visibility for Long Lists
For improved scroll performance with many tasks:

```tsx
// In TaskRow.tsx
<div
  className="border-b border-gray-100 dark:border-gray-700"
  style={{ contentVisibility: 'auto' }}
>
```

---

## Not Recommended (Already Optimized)

These areas are already following best practices:

- **useDarkMode hook** - Clean localStorage implementation
- **useDebounce hook** - Proper cleanup, 300ms delay
- **Database layer** - Dexie with useLiveQuery is optimal for local-first
- **Component structure** - Good separation of concerns
- **Accessibility** - Strong ARIA implementation
- **Tailwind usage** - No anti-patterns detected

---

## Implementation Sequence

### Phase 1: Bundle Optimization (Highest ROI)
1. Fix lucide-react barrel imports in all 9 files
2. Add dynamic imports for KeyboardShortcutsModal and EmptyState
3. Verify bundle size reduction with `npm run build`

**Expected:** 50-70% bundle size reduction

### Phase 2: Re-render Optimization
1. Add `useMemo` for filteredTasks, counts, sortedGroups in MainLayout
2. Refactor `getFilterCounts` to single-pass reduce
3. Add `useCallback` for handleToggle, handleUpdate, handleDelete
4. Hoist getPriorityColor to module level in TaskRow
5. Fix useKeyboardShortcuts dependencies

**Expected:** Smoother UI, 70% fewer re-renders

### Phase 3: Polish (Optional)
1. Use `.toSorted()` if browser support allows
2. Add `content-visibility: auto` for TaskRow
3. Extract toast components from useTasks

---

## Critical Files

**Primary (require substantial changes):**
- `src/components/MainLayout.tsx` - Add useMemo/useCallback, dynamic imports, fix lucide
- `src/components/TaskRow.tsx` - Fix lucide imports, hoist static functions
- `src/components/TaskInput.tsx` - Fix lucide imports
- `src/utils/filters.ts` - Refactor getFilterCounts to single-pass
- `src/hooks/useKeyboardShortcuts.ts` - Fix dependencies

**Secondary (lucide import fixes only):**
- `src/components/SubtaskList.tsx`
- `src/components/EmptyState.tsx`
- `src/components/SearchBar.tsx`
- `src/components/AppHeader.tsx`
- `src/components/TaskDateGroup.tsx`
- `src/components/TagBadge.tsx`
- `src/components/KeyboardShortcutsModal.tsx`

---

## Verification

After implementation:

1. **Build size:** Run `npm run build` and compare dist/ size
2. **Tests:** Run `npm run test` to ensure no regressions
3. **Manual testing:** `npm run dev` and verify all features work
4. **Performance:** Use React DevTools Profiler to measure re-renders
5. **Lighthouse:** Check performance score improvement

**Target Metrics:**
- Bundle size: -50%
- Time to Interactive: -30%
- Re-renders on filter change: -70%
