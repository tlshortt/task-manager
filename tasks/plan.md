# Plan: Dropdown filters

## Goal

Add dropdown filters for recurrence, category, priority with default “All”.

## Requirements

- Define filter UX: dropdowns for recurrence, category, priority + default “All”.
- Add state in MainLayout to track selections; wire to new Filters dropdown component.
- Extend filtering pipeline (after status + search): apply recurrence/category/priority.
- Update empty state/counts behavior if needed.
- Add tests for new filter logic + UI interactions.

## Approach

- UI
  - Add `FiltersDropdown.tsx` (or similar) under `src/components/` with 3 selects.
  - Recurrence options: All, Recurring, Non-recurring, Daily, Weekly, Monthly, Yearly.
  - Category options: All, Uncategorized, tag list from `useTags`.
  - Priority options: All, Low, Medium, High.
  - Use existing focus ring + Tailwind styles.
- State
  - Add local state in `MainLayout` for recurrence/category/priority filters.
  - Pass state + handlers to `FiltersDropdown`.
- Data
  - Extend `filterAndSearchTasks` usage: apply new filters after status + search.
  - For recurring instances, determine recurrence frequency from parent task if needed.
- Empty state / counts
  - Decide whether counts remain based on status only or on combined filters.
  - If counts stay status-only, keep `getFilterCounts` as-is and only empty state changes.
- Tests
  - `src/utils/filters.test.ts`: add cases for recurrence/category/priority filters.
  - `src/components/FiltersDropdown.test.tsx`: render options + change events.
  - `src/components/MainLayout.test.tsx` or equivalent: integration test for filtered results.

## Open questions

- Should status tab counts reflect extra filters or remain status-only?
- Should “Recurring” include instances only, parents only, or both?
- Should category filter treat missing tagIds as “Uncategorized”?

## Done criteria

- Dropdowns visible and functional.
- Filtering works with status tabs + search + dropdowns.
- Tests cover new logic and basic UI interactions.
