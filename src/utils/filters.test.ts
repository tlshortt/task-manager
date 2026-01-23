import { describe, it, expect } from 'vitest';
import { filterTasks, getFilterCounts } from './filters';
import type { Task } from '@/types';

describe('filterTasks', () => {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks: Task[] = [
    // Current task (not completed, not overdue, no due date)
    {
      id: 1,
      title: 'Current Task 1',
      completed: false,
      priority: 'medium',
      createdAt: now,
      updatedAt: now,
    },
    // Current task (not completed, not overdue, future due date)
    {
      id: 2,
      title: 'Current Task 2',
      completed: false,
      priority: 'high',
      dueDate: tomorrow,
      createdAt: now,
      updatedAt: now,
    },
    // Overdue task (not completed, past due date)
    {
      id: 3,
      title: 'Overdue Task',
      completed: false,
      priority: 'high',
      dueDate: yesterday,
      createdAt: now,
      updatedAt: now,
    },
    // Completed task
    {
      id: 4,
      title: 'Completed Task',
      completed: true,
      priority: 'low',
      dueDate: yesterday,
      createdAt: now,
      updatedAt: now,
    },
    // Another completed task
    {
      id: 5,
      title: 'Completed Task 2',
      completed: true,
      priority: 'medium',
      createdAt: now,
      updatedAt: now,
    },
  ];

  describe('current filter', () => {
    it('returns tasks that are not completed and not overdue', () => {
      const filtered = filterTasks(tasks, 'current');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(t => !t.completed)).toBe(true);
      expect(filtered.map(t => t.id)).toEqual([1, 2]);
    });

    it('excludes overdue tasks', () => {
      const filtered = filterTasks(tasks, 'current');
      const hasOverdueTask = filtered.some(t => t.id === 3);
      expect(hasOverdueTask).toBe(false);
    });

    it('excludes completed tasks', () => {
      const filtered = filterTasks(tasks, 'current');
      const completedTasks = filtered.filter(t => t.completed);
      expect(completedTasks).toHaveLength(0);
    });
  });

  describe('overdue filter', () => {
    it('returns tasks that are overdue and not completed', () => {
      const filtered = filterTasks(tasks, 'overdue');
      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.id).toBe(3);
      expect(filtered[0]!.completed).toBe(false);
    });

    it('excludes completed tasks even if past due', () => {
      const filtered = filterTasks(tasks, 'overdue');
      const hasCompletedTask = filtered.some(t => t.id === 4);
      expect(hasCompletedTask).toBe(false);
    });

    it('excludes current tasks', () => {
      const filtered = filterTasks(tasks, 'overdue');
      const currentTasks = filtered.filter(t => [1, 2].includes(t.id as number));
      expect(currentTasks).toHaveLength(0);
    });
  });

  describe('completed filter', () => {
    it('returns all completed tasks', () => {
      const filtered = filterTasks(tasks, 'completed');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(t => t.completed)).toBe(true);
      expect(filtered.map(t => t.id).sort()).toEqual([4, 5]);
    });

    it('excludes incomplete tasks', () => {
      const filtered = filterTasks(tasks, 'completed');
      const incompleteTasks = filtered.filter(t => !t.completed);
      expect(incompleteTasks).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('returns empty array for empty input', () => {
      expect(filterTasks([], 'current')).toEqual([]);
      expect(filterTasks([], 'overdue')).toEqual([]);
      expect(filterTasks([], 'completed')).toEqual([]);
    });

    it('handles tasks due today correctly (not overdue)', () => {
      const todayTasks: Task[] = [
        {
          id: 10,
          title: 'Due Today',
          completed: false,
          priority: 'medium',
          dueDate: now,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const currentFiltered = filterTasks(todayTasks, 'current');
      const overdueFiltered = filterTasks(todayTasks, 'overdue');

      expect(currentFiltered).toHaveLength(1);
      expect(overdueFiltered).toHaveLength(0);
    });
  });
});

describe('getFilterCounts', () => {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  it('returns correct counts for all filter types', () => {
    const tasks: Task[] = [
      // 2 current tasks
      {
        id: 1,
        title: 'Current 1',
        completed: false,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        title: 'Current 2',
        completed: false,
        priority: 'high',
        dueDate: tomorrow,
        createdAt: now,
        updatedAt: now,
      },
      // 1 overdue task
      {
        id: 3,
        title: 'Overdue',
        completed: false,
        priority: 'high',
        dueDate: yesterday,
        createdAt: now,
        updatedAt: now,
      },
      // 3 completed tasks
      {
        id: 4,
        title: 'Completed 1',
        completed: true,
        priority: 'low',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        title: 'Completed 2',
        completed: true,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        title: 'Completed 3',
        completed: true,
        priority: 'high',
        dueDate: yesterday,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const counts = getFilterCounts(tasks);

    expect(counts.current).toBe(2);
    expect(counts.overdue).toBe(1);
    expect(counts.completed).toBe(3);
  });

  it('returns zero counts for empty task list', () => {
    const counts = getFilterCounts([]);

    expect(counts.current).toBe(0);
    expect(counts.overdue).toBe(0);
    expect(counts.completed).toBe(0);
  });

  it('returns correct counts when all tasks are current', () => {
    const tasks: Task[] = [
      {
        id: 1,
        title: 'Task 1',
        completed: false,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        title: 'Task 2',
        completed: false,
        priority: 'high',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const counts = getFilterCounts(tasks);

    expect(counts.current).toBe(2);
    expect(counts.overdue).toBe(0);
    expect(counts.completed).toBe(0);
  });

  it('returns correct counts when all tasks are completed', () => {
    const tasks: Task[] = [
      {
        id: 1,
        title: 'Task 1',
        completed: true,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        title: 'Task 2',
        completed: true,
        priority: 'high',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const counts = getFilterCounts(tasks);

    expect(counts.current).toBe(0);
    expect(counts.overdue).toBe(0);
    expect(counts.completed).toBe(2);
  });
});
