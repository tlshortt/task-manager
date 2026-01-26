/**
 * Calendar utility functions for monthly calendar view
 */

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfDay,
  isBefore
} from 'date-fns';
import type { Task } from '@/types';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

/**
 * Gets tasks for a specific date
 */
export function getTasksForDate(tasks: Task[], date: Date): Task[] {
  const targetDay = startOfDay(date);
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    return isSameDay(startOfDay(new Date(task.dueDate)), targetDay);
  });
}

/**
 * Checks if a date has overdue tasks (incomplete tasks with due date before today)
 */
export function hasOverdueTasks(tasks: Task[], date: Date): boolean {
  const today = startOfDay(new Date());
  const targetDay = startOfDay(date);
  if (!isBefore(targetDay, today)) return false;

  return tasks.some((task) => !task.completed);
}

/**
 * Generates calendar days for a given month including padding days from adjacent months
 * Returns 42 days (6 weeks) to fill a standard calendar grid
 */
export function generateCalendarDays(month: Date, tasks: Task[]): CalendarDay[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Ensure we always have 42 days (6 weeks) for consistent grid
  const calendarDays: CalendarDay[] = days.slice(0, 42).map((date) => ({
    date,
    isCurrentMonth: isSameMonth(date, month),
    isToday: isToday(date),
    tasks: getTasksForDate(tasks, date)
  }));

  // If we have less than 42 days, pad with additional days
  while (calendarDays.length < 42) {
    const lastDay = calendarDays[calendarDays.length - 1];
    if (!lastDay) break;
    const nextDay = new Date(lastDay.date);
    nextDay.setDate(nextDay.getDate() + 1);
    calendarDays.push({
      date: nextDay,
      isCurrentMonth: isSameMonth(nextDay, month),
      isToday: isToday(nextDay),
      tasks: getTasksForDate(tasks, nextDay)
    });
  }

  return calendarDays;
}
