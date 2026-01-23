/**
 * Date utility functions for task management
 */

import {
  format,
  isToday,
  isTomorrow,
  startOfDay,
  isBefore
} from 'date-fns';
import type { Task } from '@/types';

/**
 * Groups tasks by date with keys: 'today', 'tomorrow', or formatted date string
 */
export function groupTasksByDate(tasks: Task[]): Map<string, Task[]> {
  const groups = new Map<string, Task[]>();

  for (const task of tasks) {
    if (!task.dueDate) continue;

    let key: string;
    if (isToday(task.dueDate)) {
      key = 'today';
    } else if (isTomorrow(task.dueDate)) {
      key = 'tomorrow';
    } else {
      // Format as ISO date string for consistent sorting
      key = format(task.dueDate, 'yyyy-MM-dd');
    }

    const existing = groups.get(key) || [];
    existing.push(task);
    groups.set(key, existing);
  }

  return groups;
}

/**
 * Formats a date as a display label: TODAY, TOMORROW, or MON 29 JAN
 */
export function formatDateLabel(date: Date): string {
  if (isToday(date)) {
    return 'TODAY';
  }
  if (isTomorrow(date)) {
    return 'TOMORROW';
  }
  // Format as "MON 29 JAN"
  return format(date, 'EEE d MMM').toUpperCase();
}

/**
 * Checks if a task is overdue (due date in past and not completed)
 */
export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) {
    return false;
  }
  const today = startOfDay(new Date());
  return isBefore(startOfDay(task.dueDate), today);
}

/**
 * Formats minutes as compact time string: 1hr 30m, 45m, 2hr, or --
 */
export function formatTime(minutes?: number): string {
  if (!minutes || minutes === 0) {
    return '--';
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}hr`;
  }
  return `${hours}hr ${mins}m`;
}
