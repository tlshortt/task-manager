import { describe, it, expect } from 'vitest';
import { filterTasks, getFilterCounts, searchTasks, filterAndSearchTasks, applyTaskFilters, removeRecurringParents } from './filters';
import type { Task, TaskFilters, RecurrencePattern, Id } from '@/types';
import { testId } from '@/types';

describe('filterTasks', () => {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks: Task[] = [
    // Current task (not completed, not overdue, no due date)
    {
      id: testId('1'),
      title: 'Current Task 1',
      completed: false,
      priority: 'medium',
      createdAt: now,
      updatedAt: now,
    },
    // Current task (not completed, not overdue, future due date)
    {
      id: testId('2'),
      title: 'Current Task 2',
      completed: false,
      priority: 'high',
      dueDate: tomorrow,
      createdAt: now,
      updatedAt: now,
    },
    // Overdue task (not completed, past due date)
    {
      id: testId('3'),
      title: 'Overdue Task',
      completed: false,
      priority: 'high',
      dueDate: yesterday,
      createdAt: now,
      updatedAt: now,
    },
    // Completed task
    {
      id: testId('4'),
      title: 'Completed Task',
      completed: true,
      priority: 'low',
      dueDate: yesterday,
      createdAt: now,
      updatedAt: now,
    },
    // Another completed task
    {
      id: testId('5'),
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
      expect(filtered.map(t => t.id)).toEqual(['1', '2']);
    });

    it('excludes overdue tasks', () => {
      const filtered = filterTasks(tasks, 'current');
      const hasOverdueTask = filtered.some(t => t.id === testId('3'));
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
      expect(filtered[0]!.id).toBe('3');
      expect(filtered[0]!.completed).toBe(false);
    });

    it('excludes completed tasks even if past due', () => {
      const filtered = filterTasks(tasks, 'overdue');
      const hasCompletedTask = filtered.some(t => t.id === testId('4'));
      expect(hasCompletedTask).toBe(false);
    });

    it('excludes current tasks', () => {
      const filtered = filterTasks(tasks, 'overdue');
      const currentTasks = filtered.filter(t => ['1', '2'].includes(t.id as string));
      expect(currentTasks).toHaveLength(0);
    });
  });

  describe('completed filter', () => {
    it('returns all completed tasks', () => {
      const filtered = filterTasks(tasks, 'completed');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(t => t.completed)).toBe(true);
      expect(filtered.map(t => t.id).sort()).toEqual(['4', '5']);
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
          id: testId('10'),
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
        id: testId('1'),
        title: 'Current 1',
        completed: false,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: testId('2'),
        title: 'Current 2',
        completed: false,
        priority: 'high',
        dueDate: tomorrow,
        createdAt: now,
        updatedAt: now,
      },
      // 1 overdue task
      {
        id: testId('3'),
        title: 'Overdue',
        completed: false,
        priority: 'high',
        dueDate: yesterday,
        createdAt: now,
        updatedAt: now,
      },
      // 3 completed tasks
      {
        id: testId('4'),
        title: 'Completed 1',
        completed: true,
        priority: 'low',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: testId('5'),
        title: 'Completed 2',
        completed: true,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: testId('6'),
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
        id: testId('1'),
        title: 'Task 1',
        completed: false,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: testId('2'),
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
        id: testId('1'),
        title: 'Task 1',
        completed: true,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: testId('2'),
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

describe('searchTasks', () => {
  const tasks: Task[] = [
    {
      id: testId('1'),
      title: 'Fix login bug',
      completed: false,
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: testId('2'),
      title: 'Update documentation',
      description: 'Correct typos in README',
      completed: false,
      priority: 'low',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: testId('3'),
      title: 'Refactor API',
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
  ];

  it('returns all tasks when query is empty', () => {
    expect(searchTasks(tasks, '')).toEqual(tasks);
    expect(searchTasks(tasks, '   ')).toEqual(tasks);
  });

  it('filters tasks by title (case-insensitive)', () => {
    const results = searchTasks(tasks, 'fix');
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('1');
  });

  it('filters tasks by description', () => {
    const results = searchTasks(tasks, 'typos');
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('2');
  });

  it('matches partial strings', () => {
    const results = searchTasks(tasks, 'doc');
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('2');
  });

  it('returns empty array when no matches', () => {
    expect(searchTasks(tasks, 'nonexistent')).toEqual([]);
  });

  it('trims whitespace from query', () => {
    const results = searchTasks(tasks, '  fix  ');
    expect(results).toHaveLength(1);
  });
});

describe('filterAndSearchTasks', () => {
  it('applies both status filter and search', () => {
    const tasks: Task[] = [
      { id: testId('1'), title: 'Fix bug', completed: false, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
      { id: testId('2'), title: 'Fix typo', completed: true, priority: 'low', createdAt: new Date(), updatedAt: new Date() },
    ];

    const results = filterAndSearchTasks(tasks, 'completed', 'fix');
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('2');
  });
});

describe('applyTaskFilters', () => {
  const now = new Date();
  const workTag = testId<'tags'>('tag-work');
  const homeTag = testId<'tags'>('tag-home');
  const parentId = testId<'tasks'>('parent-1');

  const tasks: Task[] = [
    {
      id: parentId,
      title: 'Daily parent',
      completed: false,
      priority: 'low',
      recurrence: { frequency: 'daily', interval: 1 },
      isRecurringParent: true,
      tagIds: [workTag],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: testId('child-1'),
      title: 'Daily instance',
      completed: false,
      priority: 'medium',
      recurringParentId: parentId,
      tagIds: [homeTag],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: testId('weekly-1'),
      title: 'Weekly task',
      completed: false,
      priority: 'high',
      recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [1] },
      tagIds: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: testId('plain-1'),
      title: 'Plain task',
      completed: false,
      priority: 'low',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const parentRecurrenceById = new Map<Id<'tasks'>, RecurrencePattern['frequency']>([
    [parentId, 'daily'],
  ]);

  it('filters by recurrence frequency using parent mappings', () => {
    const filters: TaskFilters = {
      recurrence: 'daily',
      category: 'all',
      priority: 'all',
    };

    const results = applyTaskFilters(tasks, filters, parentRecurrenceById);
    expect(results.map((task) => task.id)).toEqual([parentId, testId('child-1')]);
  });

  it('filters uncategorized and priority values', () => {
    const filters: TaskFilters = {
      recurrence: 'all',
      category: 'uncategorized',
      priority: 'high',
    };

    const results = applyTaskFilters(tasks, filters, parentRecurrenceById);
    expect(results.map((task) => task.id)).toEqual([testId('weekly-1')]);
  });

  it('filters by specific category tag', () => {
    const filters: TaskFilters = {
      recurrence: 'all',
      category: workTag,
      priority: 'all',
    };

    const results = applyTaskFilters(tasks, filters, parentRecurrenceById);
    expect(results.map((task) => task.id)).toEqual([parentId]);
  });
});

describe('removeRecurringParents', () => {
  it('removes recurring parent tasks', () => {
    const tasks: Task[] = [
      {
        id: testId<'tasks'>('parent-1'),
        title: 'Parent',
        completed: false,
        priority: 'low',
        isRecurringParent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: testId<'tasks'>('child-1'),
        title: 'Child',
        completed: false,
        priority: 'low',
        recurringParentId: testId<'tasks'>('parent-1'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const results = removeRecurringParents(tasks);
    expect(results.map((task) => task.id)).toEqual([testId<'tasks'>('child-1')]);
  });
});

describe('filter pipeline order', () => {
  it('applies status/search, then dropdown filters, then removes parents', () => {
    const parentId = testId<'tasks'>('parent-2');
    const tasks: Task[] = [
      {
        id: parentId,
        title: 'Report daily',
        completed: true,
        priority: 'high',
        recurrence: { frequency: 'daily', interval: 1 },
        isRecurringParent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: testId<'tasks'>('child-2'),
        title: 'Report daily',
        completed: true,
        priority: 'high',
        recurringParentId: parentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: testId<'tasks'>('other-1'),
        title: 'Report weekly',
        completed: true,
        priority: 'high',
        recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [1] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: testId<'tasks'>('other-2'),
        title: 'Report daily',
        completed: false,
        priority: 'high',
        recurrence: { frequency: 'daily', interval: 1 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const parentRecurrenceById = new Map<Id<'tasks'>, RecurrencePattern['frequency']>([
      [parentId, 'daily'],
    ]);

    const statusAndSearch = filterAndSearchTasks(tasks, 'completed', 'report');
    const withDropdowns = applyTaskFilters(statusAndSearch, {
      recurrence: 'daily',
      category: 'all',
      priority: 'all',
    }, parentRecurrenceById);
    const finalResults = removeRecurringParents(withDropdowns);

    expect(finalResults.map((task) => task.id)).toEqual([testId<'tasks'>('child-2')]);
  });
});
