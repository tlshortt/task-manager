import {
  isValidRecurrence,
  getValidDayOfMonth,
  getNextOccurrence,
  generateRecurrenceInstances,
  needsLookaheadExtension,
} from './recurrenceUtils';
import type { Task, RecurrencePattern } from '@/types';

describe('recurrenceUtils', () => {
  const baseTask: Task = {
    id: '1' as any,
    title: 'Test Task',
    completed: false,
    priority: 'medium',
    createdAt: new Date('2026-01-15T00:00:00'),
    updatedAt: new Date('2026-01-15T00:00:00'),
  };

  describe('isValidRecurrence', () => {
    it('validates daily recurrence', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
      expect(isValidRecurrence(pattern)).toBe(true);
    });

    it('validates weekly recurrence with days of week', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5],
      };
      expect(isValidRecurrence(pattern)).toBe(true);
    });

    it('rejects weekly recurrence without days of week', () => {
      const pattern: RecurrencePattern = { frequency: 'weekly', interval: 1 };
      expect(isValidRecurrence(pattern)).toBe(false);
    });

    it('validates monthly recurrence with day of month', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 15,
      };
      expect(isValidRecurrence(pattern)).toBe(true);
    });

    it('rejects monthly recurrence without day of month', () => {
      const pattern: RecurrencePattern = { frequency: 'monthly', interval: 1 };
      expect(isValidRecurrence(pattern)).toBe(false);
    });

    it('rejects invalid interval', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 0 };
      expect(isValidRecurrence(pattern)).toBe(false);
    });

    it('rejects invalid count', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 1, count: 0 };
      expect(isValidRecurrence(pattern)).toBe(false);
    });

    it('validates yearly recurrence', () => {
      const pattern: RecurrencePattern = { frequency: 'yearly', interval: 1 };
      expect(isValidRecurrence(pattern)).toBe(true);
    });

    it('rejects weekly recurrence with empty daysOfWeek', () => {
      const pattern: RecurrencePattern = { frequency: 'weekly', interval: 1, daysOfWeek: [] };
      expect(isValidRecurrence(pattern)).toBe(false);
    });

    it('rejects monthly recurrence with dayOfMonth 0', () => {
      const pattern: RecurrencePattern = { frequency: 'monthly', interval: 1, dayOfMonth: 0 };
      expect(isValidRecurrence(pattern)).toBe(false);
    });

    it('rejects monthly recurrence with negative dayOfMonth', () => {
      const pattern: RecurrencePattern = { frequency: 'monthly', interval: 1, dayOfMonth: -5 };
      expect(isValidRecurrence(pattern)).toBe(false);
    });

    it('rejects monthly recurrence with dayOfMonth > 31', () => {
      const pattern: RecurrencePattern = { frequency: 'monthly', interval: 1, dayOfMonth: 32 };
      expect(isValidRecurrence(pattern)).toBe(false);
    });

    it('rejects negative interval', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: -1 };
      expect(isValidRecurrence(pattern)).toBe(false);
    });

    it('rejects negative count', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 1, count: -5 };
      expect(isValidRecurrence(pattern)).toBe(false);
    });
  });

  describe('getValidDayOfMonth', () => {
    it('returns the requested day for valid dates', () => {
      expect(getValidDayOfMonth(2026, 0, 15)).toBe(15); // Jan 15
      expect(getValidDayOfMonth(2026, 0, 31)).toBe(31); // Jan 31
    });

    it('adjusts day 31 to Feb 28 in non-leap year', () => {
      expect(getValidDayOfMonth(2026, 1, 31)).toBe(28); // Feb 28, 2026
    });

    it('adjusts day 31 to Feb 29 in leap year', () => {
      expect(getValidDayOfMonth(2024, 1, 31)).toBe(29); // Feb 29, 2024
    });

    it('adjusts day 31 to April 30', () => {
      expect(getValidDayOfMonth(2026, 3, 31)).toBe(30); // April 30
    });
  });

  describe('getNextOccurrence', () => {
    it('calculates next daily occurrence', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
      const fromDate = new Date('2026-01-15T00:00:00');
      const next = getNextOccurrence(pattern, fromDate);
      expect(next).toEqual(new Date('2026-01-16T00:00:00'));
    });

    it('calculates next daily occurrence with interval 2', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 2 };
      const fromDate = new Date('2026-01-15T00:00:00');
      const next = getNextOccurrence(pattern, fromDate);
      expect(next).toEqual(new Date('2026-01-17T00:00:00'));
    });

    it('calculates next weekly occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3], // Mon, Wed
      };
      const fromDate = new Date('2026-01-19T00:00:00'); // Monday
      const next = getNextOccurrence(pattern, fromDate);
      expect(next?.getDay()).toBe(3); // Wednesday
    });

    it('calculates next weekly occurrence spanning weeks', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1], // Mon only
      };
      const fromDate = new Date('2026-01-19T00:00:00'); // Monday
      const next = getNextOccurrence(pattern, fromDate);
      expect(next).toEqual(new Date('2026-01-26T00:00:00')); // Next Monday
    });

    it('calculates next monthly occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 15,
      };
      const fromDate = new Date('2026-01-15T00:00:00');
      const next = getNextOccurrence(pattern, fromDate);
      expect(next).toEqual(new Date('2026-02-15T00:00:00'));
    });

    it('handles month boundaries for monthly recurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 31,
      };
      const fromDate = new Date('2026-01-31T00:00:00');
      const next = getNextOccurrence(pattern, fromDate);
      expect(next).toEqual(new Date('2026-02-28T00:00:00')); // Feb 28
    });

    it('calculates next yearly occurrence', () => {
      const pattern: RecurrencePattern = { frequency: 'yearly', interval: 1 };
      const fromDate = new Date('2026-01-15T00:00:00');
      const next = getNextOccurrence(pattern, fromDate);
      expect(next).toEqual(new Date('2027-01-15T00:00:00'));
    });

    it('returns null for weekly without daysOfWeek', () => {
      const pattern: RecurrencePattern = { frequency: 'weekly', interval: 1 };
      const next = getNextOccurrence(pattern, new Date('2026-01-15'));
      expect(next).toBeNull();
    });

    it('returns null for weekly with empty daysOfWeek', () => {
      const pattern: RecurrencePattern = { frequency: 'weekly', interval: 1, daysOfWeek: [] };
      const next = getNextOccurrence(pattern, new Date('2026-01-15'));
      expect(next).toBeNull();
    });

    it('returns null for monthly without dayOfMonth', () => {
      const pattern: RecurrencePattern = { frequency: 'monthly', interval: 1 };
      const next = getNextOccurrence(pattern, new Date('2026-01-15'));
      expect(next).toBeNull();
    });

    it('returns null for unknown frequency', () => {
      const pattern = { frequency: 'unknown', interval: 1 } as unknown as RecurrencePattern;
      const next = getNextOccurrence(pattern, new Date('2026-01-15'));
      expect(next).toBeNull();
    });

    it('calculates yearly with interval 2', () => {
      const pattern: RecurrencePattern = { frequency: 'yearly', interval: 2 };
      const fromDate = new Date('2026-01-15T00:00:00');
      const next = getNextOccurrence(pattern, fromDate);
      expect(next).toEqual(new Date('2028-01-15T00:00:00'));
    });

    it('calculates monthly with interval 3', () => {
      const pattern: RecurrencePattern = { frequency: 'monthly', interval: 3, dayOfMonth: 10 };
      const fromDate = new Date('2026-01-10T00:00:00');
      const next = getNextOccurrence(pattern, fromDate);
      expect(next).toEqual(new Date('2026-04-10T00:00:00'));
    });

    it('normalizes fromDate to start of day', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
      const fromDate = new Date('2026-01-15T14:30:00');
      const next = getNextOccurrence(pattern, fromDate);
      expect(next).toEqual(new Date('2026-01-16T00:00:00'));
    });

    it('handles weekly with multiple days finding next available', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [0, 2, 4], // Sun, Tue, Thu
      };
      const fromDate = new Date('2026-01-20T00:00:00'); // Tuesday
      const next = getNextOccurrence(pattern, fromDate);
      expect(next?.getDay()).toBe(4); // Thursday is next from Tuesday
    });
  });

  describe('generateRecurrenceInstances', () => {
    it('generates daily instances for 90 days', () => {
      const task: Task = {
        ...baseTask,
        recurrence: { frequency: 'daily', interval: 1 },
      };
      const instances = generateRecurrenceInstances(task, new Date('2026-01-15T00:00:00'), 90);
      expect(instances.length).toBe(91);
      expect(instances[0]!.dueDate).toEqual(new Date('2026-01-15T00:00:00'));
      expect(instances[1]!.dueDate).toEqual(new Date('2026-01-16T00:00:00'));
      expect(instances[90]!.dueDate).toEqual(new Date('2026-04-15T00:00:00'));
    });

    it('generates every-other-day instances', () => {
      const task: Task = {
        ...baseTask,
        recurrence: { frequency: 'daily', interval: 2 },
      };
      const instances = generateRecurrenceInstances(task, new Date('2026-01-15T00:00:00'), 10);
      expect(instances.length).toBe(6); // days 15, 17, 19, 21, 23, 25
      expect(instances[0]!.dueDate).toEqual(new Date('2026-01-15T00:00:00'));
      expect(instances[1]!.dueDate).toEqual(new Date('2026-01-17T00:00:00'));
    });

    it('generates weekly instances for specific days', () => {
      const task: Task = {
        ...baseTask,
        recurrence: {
          frequency: 'weekly',
          interval: 1,
          daysOfWeek: [1, 3], // Mon, Wed
        },
      };
      const instances = generateRecurrenceInstances(task, new Date('2026-01-19T00:00:00'), 14); // Start on Monday
      expect(instances.length).toBeGreaterThan(0);

      // All instances should be Monday or Wednesday
      instances.forEach((instance) => {
        const day = instance.dueDate?.getDay();
        expect([1, 3]).toContain(day);
      });
    });

    it('generates monthly instances', () => {
      const task: Task = {
        ...baseTask,
        recurrence: {
          frequency: 'monthly',
          interval: 1,
          dayOfMonth: 15,
        },
      };
      const instances = generateRecurrenceInstances(task, new Date('2026-01-15T00:00:00'), 90);
      expect(instances.length).toBe(4); // Jan 15, Feb 15, Mar 15, Apr 15
      expect(instances[0]!.dueDate).toEqual(new Date('2026-01-15T00:00:00'));
      expect(instances[1]!.dueDate).toEqual(new Date('2026-02-15T00:00:00'));
      expect(instances[2]!.dueDate).toEqual(new Date('2026-03-15T00:00:00'));
      expect(instances[3]!.dueDate).toEqual(new Date('2026-04-15T00:00:00'));
    });

    it('handles month boundaries in monthly recurrence', () => {
      const task: Task = {
        ...baseTask,
        recurrence: {
          frequency: 'monthly',
          interval: 1,
          dayOfMonth: 31,
        },
      };
      const instances = generateRecurrenceInstances(task, new Date('2026-01-31T00:00:00'), 90);
      expect(instances[0]!.dueDate).toEqual(new Date('2026-01-31T00:00:00'));
      expect(instances[1]!.dueDate).toEqual(new Date('2026-02-28T00:00:00')); // Feb 28
      expect(instances[2]!.dueDate).toEqual(new Date('2026-03-31T00:00:00')); // Mar 31
    });

    it('respects endDate condition', () => {
      const task: Task = {
        ...baseTask,
        recurrence: {
          frequency: 'daily',
          interval: 1,
          endDate: new Date('2026-02-14T00:00:00'), // 30 days from start
        },
      };
      const instances = generateRecurrenceInstances(task, new Date('2026-01-15T00:00:00'), 90);
      expect(instances.length).toBe(31); // Jan 15 - Feb 14 inclusive
      expect(instances[instances.length - 1]!.dueDate).toEqual(new Date('2026-02-14T00:00:00'));
    });

    it('respects count condition', () => {
      const task: Task = {
        ...baseTask,
        recurrence: {
          frequency: 'daily',
          interval: 1,
          count: 14,
        },
      };
      const instances = generateRecurrenceInstances(task, new Date('2026-01-15T00:00:00'), 90);
      expect(instances.length).toBe(14);
    });

    it('sets recurringParentId on instances', () => {
      const task: Task = {
        ...baseTask,
        id: '42' as any,
        recurrence: { frequency: 'daily', interval: 1 },
      };
      const instances = generateRecurrenceInstances(task, new Date('2026-01-15T00:00:00'), 7);
      instances.forEach((instance) => {
        expect(instance.recurringParentId).toBe('42');
        expect(instance.isCustomized).toBe(false);
      });
    });

    it('copies task properties to instances', () => {
      const task: Task = {
        ...baseTask,
        title: 'Daily Task',
        description: 'Task description',
        priority: 'high',
        tagIds: ['tag1' as any],
        recurrence: { frequency: 'daily', interval: 1 },
      };
      const instances = generateRecurrenceInstances(task, new Date('2026-01-15T00:00:00'), 7);
      instances.forEach((instance) => {
        expect(instance.title).toBe('Daily Task');
        expect(instance.description).toBe('Task description');
        expect(instance.priority).toBe('high');
        expect(instance.tagIds).toEqual(task.tagIds);
      });
    });

    it('returns empty array for invalid recurrence', () => {
      const task: Task = {
        ...baseTask,
        recurrence: { frequency: 'weekly', interval: 1 }, // missing daysOfWeek
      };
      const instances = generateRecurrenceInstances(task, new Date('2026-01-15T00:00:00'), 90);
      expect(instances.length).toBe(0);
    });
  });

  describe('needsLookaheadExtension', () => {
    it('returns true when no instances exist', () => {
      const result = needsLookaheadExtension([], new Date('2026-01-15T00:00:00'), 90);
      expect(result).toBe(true);
    });

    it('returns true when latest instance is within threshold', () => {
      const instances: Task[] = [
        {
          ...baseTask,
          instanceDate: new Date('2026-02-15T00:00:00'), // 31 days from current
        },
      ];
      const result = needsLookaheadExtension(instances, new Date('2026-01-15T00:00:00'), 90);
      expect(result).toBe(true);
    });

    it('returns false when latest instance is beyond threshold', () => {
      const instances: Task[] = [
        {
          ...baseTask,
          instanceDate: new Date('2026-04-20T00:00:00'), // 95 days from current
        },
      ];
      const result = needsLookaheadExtension(instances, new Date('2026-01-15T00:00:00'), 90);
      expect(result).toBe(false);
    });

    it('finds the latest instance among multiple', () => {
      const instances: Task[] = [
        { ...baseTask, instanceDate: new Date('2026-02-15T00:00:00') },
        { ...baseTask, instanceDate: new Date('2026-04-20T00:00:00') },
        { ...baseTask, instanceDate: new Date('2026-03-15T00:00:00') },
      ];
      const result = needsLookaheadExtension(instances, new Date('2026-01-15T00:00:00'), 90);
      expect(result).toBe(false); // latest is Apr 20, beyond threshold
    });
  });
});
