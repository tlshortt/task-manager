import { describe, it, expect } from 'vitest';
import {
  groupTasksByDate,
  formatDateLabel,
  isOverdue,
  formatTime
} from './dateUtils';
import type { Task } from '@/types';

describe('groupTasksByDate', () => {
  it('groups tasks by today', () => {
    const today = new Date();
    const tasks: Task[] = [
      {
        id: 1,
        title: 'Task 1',
        completed: false,
        priority: 'medium',
        dueDate: today,
        createdAt: today,
        updatedAt: today,
      },
    ];

    const groups = groupTasksByDate(tasks);
    expect(groups.has('today')).toBe(true);
    expect(groups.get('today')).toHaveLength(1);
  });

  it('groups tasks by tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tasks: Task[] = [
      {
        id: 1,
        title: 'Task 1',
        completed: false,
        priority: 'medium',
        dueDate: tomorrow,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const groups = groupTasksByDate(tasks);
    expect(groups.has('tomorrow')).toBe(true);
    expect(groups.get('tomorrow')).toHaveLength(1);
  });

  it('groups tasks by ISO date for other days', () => {
    // Use a date that's definitely not today or tomorrow
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // One week from now

    const tasks: Task[] = [
      {
        id: 1,
        title: 'Task 1',
        completed: false,
        priority: 'medium',
        dueDate: futureDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const groups = groupTasksByDate(tasks);
    expect(groups.size).toBe(1);

    // Get the first (and only) key
    const keys = Array.from(groups.keys());
    const firstKey = keys[0] as string;
    expect(firstKey).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO format

    const groupedTasks = groups.get(firstKey);
    expect(groupedTasks).toBeDefined();
    expect(groupedTasks!).toHaveLength(1);
  });

  it('skips tasks without due dates', () => {
    const tasks: Task[] = [
      {
        id: 1,
        title: 'Task 1',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const groups = groupTasksByDate(tasks);
    expect(groups.size).toBe(0);
  });

  it('groups multiple tasks correctly', () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks: Task[] = [
      {
        id: 1,
        title: 'Task 1',
        completed: false,
        priority: 'medium',
        dueDate: today,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: 'Task 2',
        completed: false,
        priority: 'medium',
        dueDate: today,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        title: 'Task 3',
        completed: false,
        priority: 'medium',
        dueDate: tomorrow,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const groups = groupTasksByDate(tasks);
    expect(groups.get('today')).toHaveLength(2);
    expect(groups.get('tomorrow')).toHaveLength(1);
  });
});

describe('formatDateLabel', () => {
  it('formats today as TODAY', () => {
    const today = new Date();
    expect(formatDateLabel(today)).toBe('TODAY');
  });

  it('formats tomorrow as TOMORROW', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(formatDateLabel(tomorrow)).toBe('TOMORROW');
  });

  it('formats other dates as EEE D MMM', () => {
    const date = new Date('2026-02-15'); // Sunday, Feb 15
    const label = formatDateLabel(date);
    // Should match pattern like "SUN 15 FEB"
    expect(label).toMatch(/^[A-Z]{3} \d{1,2} [A-Z]{3}$/);
    expect(label).toContain('FEB');
  });
});

describe('isOverdue', () => {
  it('returns false for completed tasks', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const task: Task = {
      id: 1,
      title: 'Task 1',
      completed: true,
      priority: 'medium',
      dueDate: yesterday,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(isOverdue(task)).toBe(false);
  });

  it('returns false for tasks without due dates', () => {
    const task: Task = {
      id: 1,
      title: 'Task 1',
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(isOverdue(task)).toBe(false);
  });

  it('returns true for past due uncompleted tasks', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const task: Task = {
      id: 1,
      title: 'Task 1',
      completed: false,
      priority: 'medium',
      dueDate: yesterday,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(isOverdue(task)).toBe(true);
  });

  it('returns false for tasks due today', () => {
    const today = new Date();

    const task: Task = {
      id: 1,
      title: 'Task 1',
      completed: false,
      priority: 'medium',
      dueDate: today,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(isOverdue(task)).toBe(false);
  });

  it('returns false for future tasks', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const task: Task = {
      id: 1,
      title: 'Task 1',
      completed: false,
      priority: 'medium',
      dueDate: tomorrow,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(isOverdue(task)).toBe(false);
  });
});

describe('formatTime', () => {
  it('formats 90 minutes as 1hr 30m', () => {
    expect(formatTime(90)).toBe('1hr 30m');
  });

  it('formats 45 minutes as 45m', () => {
    expect(formatTime(45)).toBe('45m');
  });

  it('formats 120 minutes as 2hr', () => {
    expect(formatTime(120)).toBe('2hr');
  });

  it('formats 0 as --', () => {
    expect(formatTime(0)).toBe('--');
  });

  it('formats undefined as --', () => {
    expect(formatTime(undefined)).toBe('--');
  });

  it('formats 1 minute as 1m', () => {
    expect(formatTime(1)).toBe('1m');
  });

  it('formats 60 minutes as 1hr', () => {
    expect(formatTime(60)).toBe('1hr');
  });

  it('formats 185 minutes as 3hr 5m', () => {
    expect(formatTime(185)).toBe('3hr 5m');
  });
});
