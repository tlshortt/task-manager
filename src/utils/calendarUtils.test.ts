import { describe, it, expect } from 'vitest';
import {
  generateCalendarDays,
  getTasksForDate,
  hasOverdueTasks
} from './calendarUtils';
import type { Task } from '@/types';

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1' as any,
  title: 'Test Task',
  completed: false,
  priority: 'medium',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

describe('getTasksForDate', () => {
  it('returns tasks matching the given date', () => {
    const targetDate = new Date('2026-01-15');
    const tasks: Task[] = [
      createTask({ id: '1' as any, title: 'Task 1', dueDate: new Date('2026-01-15') }),
      createTask({ id: '2' as any, title: 'Task 2', dueDate: new Date('2026-01-16') }),
      createTask({ id: '3' as any, title: 'Task 3', dueDate: new Date('2026-01-15') })
    ];

    const result = getTasksForDate(tasks, targetDate);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toEqual(['1', '3']);
  });

  it('returns empty array when no tasks match', () => {
    const targetDate = new Date('2026-01-20');
    const tasks: Task[] = [
      createTask({ id: '1' as any, dueDate: new Date('2026-01-15') })
    ];

    const result = getTasksForDate(tasks, targetDate);
    expect(result).toHaveLength(0);
  });

  it('excludes tasks without due dates', () => {
    const targetDate = new Date('2026-01-15');
    const tasks: Task[] = [
      createTask({ id: '1' as any, dueDate: new Date('2026-01-15') }),
      createTask({ id: '2' as any, dueDate: undefined })
    ];

    const result = getTasksForDate(tasks, targetDate);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
  });

  it('handles different times on same day', () => {
    const targetDate = new Date('2026-01-15T00:00:00');
    const tasks: Task[] = [
      createTask({ id: '1' as any, dueDate: new Date('2026-01-15T09:30:00') }),
      createTask({ id: '2' as any, dueDate: new Date('2026-01-15T23:59:59') })
    ];

    const result = getTasksForDate(tasks, targetDate);
    expect(result).toHaveLength(2);
  });
});

describe('hasOverdueTasks', () => {
  it('returns true when date has incomplete tasks before today', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const tasks: Task[] = [createTask({ completed: false })];

    expect(hasOverdueTasks(tasks, yesterday)).toBe(true);
  });

  it('returns false when all tasks are completed', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const tasks: Task[] = [createTask({ completed: true })];

    expect(hasOverdueTasks(tasks, yesterday)).toBe(false);
  });

  it('returns false for today', () => {
    const today = new Date();
    const tasks: Task[] = [createTask({ completed: false })];

    expect(hasOverdueTasks(tasks, today)).toBe(false);
  });

  it('returns false for future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks: Task[] = [createTask({ completed: false })];

    expect(hasOverdueTasks(tasks, tomorrow)).toBe(false);
  });

  it('returns false when no tasks exist', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(hasOverdueTasks([], yesterday)).toBe(false);
  });
});

describe('generateCalendarDays', () => {
  it('returns 42 days (6 weeks)', () => {
    const month = new Date('2026-01-15');
    const result = generateCalendarDays(month, []);

    expect(result).toHaveLength(42);
  });

  it('marks current month days correctly', () => {
    const month = new Date('2026-01-15');
    const result = generateCalendarDays(month, []);

    // January 2026 has 31 days
    const currentMonthDays = result.filter((d) => d.isCurrentMonth);
    expect(currentMonthDays).toHaveLength(31);
  });

  it('includes padding days from previous month', () => {
    // January 2026 starts on Thursday (index 4)
    const month = new Date('2026-01-15');
    const result = generateCalendarDays(month, []);

    // First 4 days should be from December 2025 (Sun-Wed)
    const firstDay = result[0];
    expect(firstDay?.isCurrentMonth).toBe(false);
    expect(firstDay?.date.getMonth()).toBe(11); // December
  });

  it('includes padding days from next month', () => {
    const month = new Date('2026-01-15');
    const result = generateCalendarDays(month, []);

    const lastDay = result[41];
    expect(lastDay?.isCurrentMonth).toBe(false);
    expect(lastDay?.date.getMonth()).toBe(1); // February
  });

  it('marks today correctly', () => {
    const today = new Date();
    const result = generateCalendarDays(today, []);

    const todayEntry = result.find((d) => d.isToday);
    expect(todayEntry).toBeDefined();
    expect(todayEntry?.date.getDate()).toBe(today.getDate());
  });

  it('assigns tasks to correct days', () => {
    const month = new Date(2026, 0, 15); // Jan 15, 2026 (local time)
    const tasks: Task[] = [
      createTask({ id: '1' as any, title: 'Task 1', dueDate: new Date(2026, 0, 10) }),
      createTask({ id: '2' as any, title: 'Task 2', dueDate: new Date(2026, 0, 10) }),
      createTask({ id: '3' as any, title: 'Task 3', dueDate: new Date(2026, 0, 20) })
    ];

    const result = generateCalendarDays(month, tasks);

    // Find January 10th
    const jan10 = result.find(
      (d) => d.date.getDate() === 10 && d.date.getMonth() === 0
    );
    expect(jan10?.tasks).toHaveLength(2);

    // Find January 20th
    const jan20 = result.find(
      (d) => d.date.getDate() === 20 && d.date.getMonth() === 0
    );
    expect(jan20?.tasks).toHaveLength(1);
  });

  it('starts week on Sunday', () => {
    const month = new Date('2026-01-15');
    const result = generateCalendarDays(month, []);

    // First day should be a Sunday
    expect(result[0]?.date.getDay()).toBe(0);
  });
});
