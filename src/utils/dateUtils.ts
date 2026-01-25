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
    let key: string;

    if (!task.dueDate) {
      key = 'no-date';
    } else if (isToday(task.dueDate)) {
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

/**
 * Sorts grouped task entries: today, tomorrow, chronological dates, no-date last
 */
export function sortDateGroups<T>(groups: Map<string, T>): [string, T][] {
  return Array.from(groups.entries()).sort(([keyA], [keyB]) => {
    if (keyA === 'today') return -1;
    if (keyB === 'today') return 1;
    if (keyA === 'tomorrow') return -1;
    if (keyB === 'tomorrow') return 1;
    if (keyA === 'no-date') return 1;
    if (keyB === 'no-date') return -1;
    return keyA.localeCompare(keyB);
  });
}

/**
 * Parses time string to minutes
 * Formats: '90m', '1hr', '1hr 30m', '1.5hr', '45'
 * Returns undefined for invalid input
 */
export function parseTime(input: string): number | undefined {
  if (!input || typeof input !== 'string') {
    return undefined;
  }

  const trimmed = input.trim().toLowerCase();

  // Plain number
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    return isNaN(num) ? undefined : num;
  }

  // Decimal hours: 1.5hr
  const decimalHrMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*hr?$/);
  if (decimalHrMatch && decimalHrMatch[1]) {
    const hours = parseFloat(decimalHrMatch[1]);
    return isNaN(hours) ? undefined : Math.round(hours * 60);
  }

  // Minutes only: 90m
  const minutesMatch = trimmed.match(/^(\d+)\s*m$/);
  if (minutesMatch && minutesMatch[1]) {
    const mins = parseInt(minutesMatch[1], 10);
    return isNaN(mins) ? undefined : mins;
  }

  // Hours and minutes: 1hr 30m
  const hourMinMatch = trimmed.match(/^(\d+)\s*hr?\s+(\d+)\s*m$/);
  if (hourMinMatch && hourMinMatch[1] && hourMinMatch[2]) {
    const hours = parseInt(hourMinMatch[1], 10);
    const mins = parseInt(hourMinMatch[2], 10);
    if (isNaN(hours) || isNaN(mins)) {
      return undefined;
    }
    return hours * 60 + mins;
  }

  // Hours only: 1hr
  const hoursMatch = trimmed.match(/^(\d+)\s*hr?$/);
  if (hoursMatch && hoursMatch[1]) {
    const hours = parseInt(hoursMatch[1], 10);
    return isNaN(hours) ? undefined : hours * 60;
  }

  return undefined;
}
