/**
 * Pure sorting functions for tasks.
 * Each comparator is side-effect-free and testable.
 */

import type { Task, SortState, SortDirection, Priority } from '@/types';

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Wraps a comparator so completed tasks always sort to the bottom.
 */
function completedLast(compare: (a: Task, b: Task) => number) {
  return (a: Task, b: Task): number => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return compare(a, b);
  };
}

/**
 * Compare by priority value.
 * Ascending: low → medium → high. Descending: high → medium → low.
 */
function compareByPriority(a: Task, b: Task, direction: SortDirection): number {
  const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  return direction === 'asc' ? diff : -diff;
}

/**
 * Compare by title (case-insensitive).
 * Ascending: A → Z. Descending: Z → A.
 */
function compareByTitle(a: Task, b: Task, direction: SortDirection): number {
  const diff = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
  return direction === 'asc' ? diff : -diff;
}

/**
 * Compare by createdAt timestamp.
 * Ascending: oldest first. Descending: newest first.
 */
function compareByCreatedAt(a: Task, b: Task, direction: SortDirection): number {
  const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  return direction === 'asc' ? diff : -diff;
}

/**
 * Compare by due date, preserving date-group semantics.
 * Ascending: earlier dates first, no due date last.
 * Descending: later dates first, no due date last.
 */
function compareByDueDate(a: Task, b: Task, direction: SortDirection): number {
  const aDate = a.dueDate ? new Date(a.dueDate).getTime() : null;
  const bDate = b.dueDate ? new Date(b.dueDate).getTime() : null;

  // No due date always sorts after tasks with a due date
  if (aDate === null && bDate === null) return 0;
  if (aDate === null) return 1;
  if (bDate === null) return -1;

  const diff = aDate - bDate;
  return direction === 'asc' ? diff : -diff;
}

/**
 * Sort tasks according to the given sort state.
 * Returns a new sorted array (does not mutate the input).
 * Completed tasks always sort to the bottom regardless of field.
 */
export function sortTasks(tasks: Task[], sortState: SortState): Task[] {
  const { field, direction } = sortState;

  let compare: (a: Task, b: Task) => number;

  switch (field) {
    case 'priority':
      compare = (a, b) => compareByPriority(a, b, direction);
      break;
    case 'title':
      compare = (a, b) => compareByTitle(a, b, direction);
      break;
    case 'createdAt':
      compare = (a, b) => compareByCreatedAt(a, b, direction);
      break;
    case 'dueDate':
    default:
      compare = (a, b) => compareByDueDate(a, b, direction);
      break;
  }

  return [...tasks].sort(completedLast(compare));
}
