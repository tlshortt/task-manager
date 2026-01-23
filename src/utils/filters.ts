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
  return {
    current: filterTasks(tasks, 'current').length,
    overdue: filterTasks(tasks, 'overdue').length,
    completed: filterTasks(tasks, 'completed').length,
  };
}
