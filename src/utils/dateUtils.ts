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

  // Pre-compute today and tomorrow keys for consistent comparison
  const today = startOfDay(new Date());
  const tomorrow = startOfDay(new Date(Date.now() + 86400000));
  const todayKey = format(today, 'yyyy-MM-dd');
  const tomorrowKey = format(tomorrow, 'yyyy-MM-dd');

  console.log('[groupTasksByDate] todayKey:', todayKey, 'tomorrowKey:', tomorrowKey);

  for (const task of tasks) {
    let key: string;

    if (!task.dueDate) {
      key = 'no-date';
    } else {
      // Normalize to start of day and format for consistent grouping
      // (handles string dates from IndexedDB and timezone edge cases)
      const normalizedDate = startOfDay(new Date(task.dueDate));
      const dateKey = format(normalizedDate, 'yyyy-MM-dd');

      console.log('[groupTasksByDate] task:', task.title, 'dueDate:', task.dueDate, 'dateKey:', dateKey);

      if (dateKey === todayKey) {
        key = 'today';
      } else if (dateKey === tomorrowKey) {
        key = 'tomorrow';
      } else {
        key = dateKey;
      }
    }

    console.log('[groupTasksByDate] task:', task.title, 'assigned key:', key);

    const existing = groups.get(key) || [];
    existing.push(task);
    groups.set(key, existing);
  }

  console.log('[groupTasksByDate] final groups:', Array.from(groups.entries()).map(([k, v]) => `${k}: ${v.length} tasks`));

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
 * Sorts grouped task entries: today, tomorrow, chronological dates, no-date last
 */
export function sortDateGroups<T>(groups: Map<string, T>): [string, T][] {
  return Array.from(groups.entries()).toSorted(([keyA], [keyB]) => {
    if (keyA === 'today') return -1;
    if (keyB === 'today') return 1;
    if (keyA === 'tomorrow') return -1;
    if (keyB === 'tomorrow') return 1;
    if (keyA === 'no-date') return 1;
    if (keyB === 'no-date') return -1;
    return keyA.localeCompare(keyB);
  });
}
