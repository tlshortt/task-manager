import type { Task, RecurrencePattern } from '@/types';
import { DEFAULT_LOOKAHEAD_DAYS, MAX_RECURRENCE_INSTANCES } from '@/constants/recurrence';
import { startOfDay, addDays, addMonths, addYears, differenceInDays } from 'date-fns';

/**
 * Validates a recurrence pattern
 */
export function isValidRecurrence(pattern: RecurrencePattern): boolean {
  if (!pattern.frequency || pattern.interval < 1) {
    return false;
  }

  if (pattern.frequency === 'weekly' && (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0)) {
    return false;
  }

  if (pattern.frequency === 'monthly' && (!pattern.dayOfMonth || pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31)) {
    return false;
  }

  if (pattern.count !== undefined && pattern.count < 1) {
    return false;
  }

  return true;
}

/**
 * Gets a valid day of month, handling month boundaries
 * e.g., if requesting day 31 of February, returns 28 (or 29 for leap year)
 */
export function getValidDayOfMonth(year: number, month: number, day: number): number {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return Math.min(day, lastDayOfMonth);
}

/**
 * Gets the next occurrence date from a recurrence pattern
 */
export function getNextOccurrence(recurrence: RecurrencePattern, fromDate: Date): Date | null {
  const normalized = startOfDay(fromDate);

  switch (recurrence.frequency) {
    case 'daily':
      return addDays(normalized, recurrence.interval);

    case 'weekly': {
      if (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) {
        return null;
      }

      let candidate = addDays(normalized, 1);
      const maxIterations = recurrence.interval * 7;

      for (let i = 0; i < maxIterations; i++) {
        const dayOfWeek = candidate.getDay();

        if (recurrence.daysOfWeek.includes(dayOfWeek)) {
          const weeksSinceStart = Math.floor(differenceInDays(candidate, normalized) / 7);
          if (weeksSinceStart % recurrence.interval === 0 || differenceInDays(candidate, normalized) < 7) {
            return candidate;
          }
        }

        candidate = addDays(candidate, 1);
      }

      return null;
    }

    case 'monthly': {
      if (!recurrence.dayOfMonth) {
        return null;
      }

      const nextMonth = addMonths(normalized, recurrence.interval);
      const validDay = getValidDayOfMonth(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        recurrence.dayOfMonth
      );

      return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), validDay);
    }

    case 'yearly':
      return addYears(normalized, recurrence.interval);

    default:
      return null;
  }
}

/**
 * Generates recurring task instances from a parent task
 */
export function generateRecurrenceInstances(
  parentTask: Task,
  startDate: Date = new Date(),
  lookaheadDays: number = DEFAULT_LOOKAHEAD_DAYS
): Omit<Task, 'id'>[] {
  if (!parentTask.recurrence || !isValidRecurrence(parentTask.recurrence)) {
    return [];
  }

  const instances: Omit<Task, 'id'>[] = [];
  const normalizedStart = startOfDay(startDate);
  const endOfWindow = addDays(normalizedStart, lookaheadDays);

  let currentDate = getNextOccurrence(parentTask.recurrence, normalizedStart);

  // For weekly recurrence, start from today if today matches the pattern
  if (parentTask.recurrence.frequency === 'weekly' && parentTask.recurrence.daysOfWeek) {
    const todayDayOfWeek = normalizedStart.getDay();
    if (parentTask.recurrence.daysOfWeek.includes(todayDayOfWeek)) {
      currentDate = normalizedStart;
    }
  }

  // For daily recurrence, include the start date
  if (parentTask.recurrence.frequency === 'daily') {
    currentDate = normalizedStart;
  }

  // For monthly recurrence, include start date if it matches the dayOfMonth
  if (parentTask.recurrence.frequency === 'monthly' && parentTask.recurrence.dayOfMonth) {
    const startDayOfMonth = normalizedStart.getDate();
    if (startDayOfMonth === parentTask.recurrence.dayOfMonth) {
      currentDate = normalizedStart;
    }
  }

  while (currentDate && instances.length < MAX_RECURRENCE_INSTANCES) {
    // Check end date condition
    if (parentTask.recurrence.endDate && currentDate > parentTask.recurrence.endDate) {
      break;
    }

    // Check count condition
    if (parentTask.recurrence.count && instances.length >= parentTask.recurrence.count) {
      break;
    }

    // Check if within lookahead window
    if (currentDate > endOfWindow) {
      break;
    }

    // Create instance
    instances.push({
      title: parentTask.title,
      description: parentTask.description,
      completed: false,
      priority: parentTask.priority,
      dueDate: currentDate,
      subtasks: parentTask.subtasks,
      tagIds: parentTask.tagIds,
      createdAt: new Date(),
      updatedAt: new Date(),
      recurringParentId: parentTask.id,
      instanceDate: currentDate,
      isCustomized: false,
    });

    // Get next occurrence
    currentDate = getNextOccurrence(parentTask.recurrence, currentDate);
  }

  return instances;
}

/**
 * Checks if the lookahead window needs to be extended
 */
export function needsLookaheadExtension(
  instances: Task[],
  currentDate: Date,
  windowDays: number = DEFAULT_LOOKAHEAD_DAYS
): boolean {
  if (instances.length === 0) {
    return true;
  }

  const normalizedCurrent = startOfDay(currentDate);
  const firstInstance = instances[0];
  const latestInstance = instances.reduce((latest, instance) => {
    if (!instance.instanceDate) return latest;
    return instance.instanceDate > latest ? instance.instanceDate : latest;
  }, firstInstance?.instanceDate ?? normalizedCurrent);

  const daysDifference = differenceInDays(latestInstance, normalizedCurrent);

  return daysDifference < windowDays;
}
