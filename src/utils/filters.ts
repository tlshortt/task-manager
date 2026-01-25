/**
 * Filter utility functions for task management
 */

import type { Task, FilterType } from '@/types';
import { isOverdue } from './dateUtils';

/**
 * Filters tasks based on the selected filter type
 * - current: not completed and not overdue
 * - overdue: past due date and not completed
 * - completed: completed tasks
 */
export function filterTasks(tasks: Task[], filter: FilterType): Task[] {
  switch (filter) {
    case 'current':
      return tasks.filter(task => !task.completed && !isOverdue(task));
    case 'overdue':
      return tasks.filter(task => !task.completed && isOverdue(task));
    case 'completed':
      return tasks.filter(task => task.completed);
    default:
      return tasks;
  }
}

/**
 * Gets counts for each filter type
 */
export function getFilterCounts(tasks: Task[]): {
  current: number;
  overdue: number;
  completed: number;
} {
  return tasks.reduce(
    (acc, task) => {
      if (task.completed) {
        acc.completed++;
      } else if (isOverdue(task)) {
        acc.overdue++;
      } else {
        acc.current++;
      }
      return acc;
    },
    { current: 0, overdue: 0, completed: 0 }
  );
}

/**
 * Searches tasks by title and description
 * Case-insensitive, matches partial strings
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
  if (!query.trim()) {
    return tasks;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return tasks.filter(task => {
    // Search in title
    const titleMatch = task.title.toLowerCase().includes(normalizedQuery);

    // Search in description
    const descriptionMatch = task.description?.toLowerCase().includes(normalizedQuery) ?? false;

    return titleMatch || descriptionMatch;
  });
}

/**
 * Combines status filtering and search
 * First filters by status, then applies search
 */
export function filterAndSearchTasks(
  tasks: Task[],
  filter: FilterType,
  searchQuery: string
): Task[] {
  const filtered = filterTasks(tasks, filter);
  return searchTasks(filtered, searchQuery);
}
