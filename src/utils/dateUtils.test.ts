import { describe, it, expect } from 'vitest';
import {
  groupTasksByDate,
  formatDateLabel,
  isOverdue,
  isDateOverdue,
  isSubtaskOverdue,
  isValidSubtaskDate,
  getMaxSubtaskDate,
  sortDateGroups
} from './dateUtils';
import type { Task, Subtask } from '@/types';

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

  it('groups tasks without due dates under no-date key', () => {
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
    expect(groups.has('no-date')).toBe(true);
    expect(groups.get('no-date')).toHaveLength(1);
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

describe('isDateOverdue', () => {
  it('returns true for dates in the past', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isDateOverdue(yesterday)).toBe(true);
  });

  it('returns false for today', () => {
    const today = new Date();
    expect(isDateOverdue(today)).toBe(false);
  });

  it('returns false for future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isDateOverdue(tomorrow)).toBe(false);
  });

  it('returns true for dates far in the past', () => {
    const longAgo = new Date();
    longAgo.setFullYear(longAgo.getFullYear() - 1);
    expect(isDateOverdue(longAgo)).toBe(true);
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

describe('isSubtaskOverdue', () => {
  it('returns false for completed subtasks', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const subtask: Subtask = {
      id: '1',
      title: 'Subtask 1',
      completed: true,
      dueDate: yesterday,
    };

    expect(isSubtaskOverdue(subtask)).toBe(false);
  });

  it('returns false for subtasks without due dates', () => {
    const subtask: Subtask = {
      id: '1',
      title: 'Subtask 1',
      completed: false,
    };

    expect(isSubtaskOverdue(subtask)).toBe(false);
  });

  it('returns true for past due uncompleted subtasks', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const subtask: Subtask = {
      id: '1',
      title: 'Subtask 1',
      completed: false,
      dueDate: yesterday,
    };

    expect(isSubtaskOverdue(subtask)).toBe(true);
  });

  it('returns false for subtasks due today', () => {
    const today = new Date();

    const subtask: Subtask = {
      id: '1',
      title: 'Subtask 1',
      completed: false,
      dueDate: today,
    };

    expect(isSubtaskOverdue(subtask)).toBe(false);
  });

  it('returns false for future subtasks', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const subtask: Subtask = {
      id: '1',
      title: 'Subtask 1',
      completed: false,
      dueDate: tomorrow,
    };

    expect(isSubtaskOverdue(subtask)).toBe(false);
  });

  it('returns true for subtasks with priority that are overdue', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const subtask: Subtask = {
      id: '1',
      title: 'Subtask 1',
      completed: false,
      priority: 'high',
      dueDate: yesterday,
    };

    expect(isSubtaskOverdue(subtask)).toBe(true);
  });
});

describe('isValidSubtaskDate', () => {
  it('returns true when no parent due date is provided', () => {
    const subtaskDate = new Date();
    subtaskDate.setDate(subtaskDate.getDate() + 30);
    expect(isValidSubtaskDate(subtaskDate)).toBe(true);
  });

  it('returns true when subtask date is before parent due date', () => {
    const parentDueDate = new Date();
    parentDueDate.setDate(parentDueDate.getDate() + 7);

    const subtaskDate = new Date();
    subtaskDate.setDate(subtaskDate.getDate() + 3);

    expect(isValidSubtaskDate(subtaskDate, parentDueDate)).toBe(true);
  });

  it('returns true when subtask date equals parent due date', () => {
    const parentDueDate = new Date();
    parentDueDate.setDate(parentDueDate.getDate() + 7);

    const subtaskDate = new Date(parentDueDate);

    expect(isValidSubtaskDate(subtaskDate, parentDueDate)).toBe(true);
  });

  it('returns false when subtask date is after parent due date', () => {
    const parentDueDate = new Date();
    parentDueDate.setDate(parentDueDate.getDate() + 7);

    const subtaskDate = new Date();
    subtaskDate.setDate(subtaskDate.getDate() + 10);

    expect(isValidSubtaskDate(subtaskDate, parentDueDate)).toBe(false);
  });

  it('handles dates in the past correctly', () => {
    const parentDueDate = new Date();
    parentDueDate.setDate(parentDueDate.getDate() - 3);

    const subtaskDate = new Date();
    subtaskDate.setDate(subtaskDate.getDate() - 5);

    expect(isValidSubtaskDate(subtaskDate, parentDueDate)).toBe(true);
  });
});

describe('getMaxSubtaskDate', () => {
  it('returns undefined when no parent due date is provided', () => {
    expect(getMaxSubtaskDate()).toBeUndefined();
  });

  it('returns undefined when parent due date is undefined', () => {
    expect(getMaxSubtaskDate(undefined)).toBeUndefined();
  });

  it('returns the parent due date normalized to start of day', () => {
    const parentDueDate = new Date('2026-03-15T14:30:00');
    const maxDate = getMaxSubtaskDate(parentDueDate);

    expect(maxDate).toBeDefined();
    expect(maxDate!.getFullYear()).toBe(2026);
    expect(maxDate!.getMonth()).toBe(2); // March is month 2
    expect(maxDate!.getDate()).toBe(15);
    expect(maxDate!.getHours()).toBe(0);
    expect(maxDate!.getMinutes()).toBe(0);
    expect(maxDate!.getSeconds()).toBe(0);
  });

  it('returns the same day when parent due date is already start of day', () => {
    const parentDueDate = new Date('2026-03-15T00:00:00');
    const maxDate = getMaxSubtaskDate(parentDueDate);

    expect(maxDate).toBeDefined();
    expect(maxDate!.getDate()).toBe(15);
  });
});

describe('sortDateGroups', () => {
  it('sorts today first', () => {
    const groups = new Map([
      ['2026-02-15', ['task1']],
      ['today', ['task2']],
    ]);
    const sorted = sortDateGroups(groups);
    expect(sorted[0]?.[0]).toBe('today');
  });

  it('sorts tomorrow after today', () => {
    const groups = new Map([
      ['tomorrow', ['task1']],
      ['today', ['task2']],
    ]);
    const sorted = sortDateGroups(groups);
    expect(sorted[0]?.[0]).toBe('today');
    expect(sorted[1]?.[0]).toBe('tomorrow');
  });

  it('sorts no-date last', () => {
    const groups = new Map([
      ['no-date', ['task1']],
      ['today', ['task2']],
      ['2026-02-15', ['task3']],
    ]);
    const sorted = sortDateGroups(groups);
    expect(sorted[sorted.length - 1]?.[0]).toBe('no-date');
  });

  it('sorts ISO dates chronologically', () => {
    const groups = new Map([
      ['2026-02-20', ['task1']],
      ['2026-02-15', ['task2']],
      ['2026-02-18', ['task3']],
    ]);
    const sorted = sortDateGroups(groups);
    expect(sorted.map(([key]) => key)).toEqual(['2026-02-15', '2026-02-18', '2026-02-20']);
  });

  it('handles full sorting order correctly', () => {
    const groups = new Map([
      ['no-date', ['task1']],
      ['2026-02-20', ['task2']],
      ['tomorrow', ['task3']],
      ['today', ['task4']],
      ['2026-02-15', ['task5']],
    ]);
    const sorted = sortDateGroups(groups);
    expect(sorted.map(([key]) => key)).toEqual([
      'today',
      'tomorrow',
      '2026-02-15',
      '2026-02-20',
      'no-date',
    ]);
  });
});
