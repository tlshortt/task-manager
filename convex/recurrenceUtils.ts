/**
 * Convex-compatible recurrence utilities
 * Works with timestamps (milliseconds) instead of Date objects
 * No browser APIs or date-fns dependencies
 */

export const DEFAULT_LOOKAHEAD_DAYS = 90;
export const MAX_RECURRENCE_INSTANCES = 365;

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDateMs?: number;
  count?: number;
}

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
 * Get start of day timestamp (UTC midnight)
 */
function startOfDayMs(timestampMs: number): number {
  const date = new Date(timestampMs);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Add days to a timestamp
 */
function addDaysMs(timestampMs: number, days: number): number {
  return timestampMs + (days * 24 * 60 * 60 * 1000);
}

/**
 * Add months to a timestamp
 */
function addMonthsMs(timestampMs: number, months: number): number {
  const date = new Date(timestampMs);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.getTime();
}

/**
 * Add years to a timestamp
 */
function addYearsMs(timestampMs: number, years: number): number {
  const date = new Date(timestampMs);
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.getTime();
}

/**
 * Get day of week (0=Sun, 1=Mon, ..., 6=Sat)
 */
function getDayOfWeek(timestampMs: number): number {
  return new Date(timestampMs).getUTCDay();
}

/**
 * Get difference in days between two timestamps
 */
function differenceInDaysMs(timestampMs1: number, timestampMs2: number): number {
  const diff = timestampMs1 - timestampMs2;
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

/**
 * Gets a valid day of month, handling month boundaries
 */
export function getValidDayOfMonth(year: number, month: number, day: number): number {
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Math.min(day, lastDayOfMonth);
}

/**
 * Gets the next occurrence timestamp from a recurrence pattern
 */
export function getNextOccurrenceMs(recurrence: RecurrencePattern, fromTimestampMs: number): number | null {
  const normalized = startOfDayMs(fromTimestampMs);

  switch (recurrence.frequency) {
    case 'daily':
      return addDaysMs(normalized, recurrence.interval);

    case 'weekly': {
      if (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) {
        return null;
      }

      let candidate = addDaysMs(normalized, 1);
      const maxIterations = recurrence.interval * 7;

      for (let i = 0; i < maxIterations; i++) {
        const dayOfWeek = getDayOfWeek(candidate);

        if (recurrence.daysOfWeek.includes(dayOfWeek)) {
          const weeksSinceStart = Math.floor(differenceInDaysMs(candidate, normalized) / 7);
          if (weeksSinceStart % recurrence.interval === 0 || differenceInDaysMs(candidate, normalized) < 7) {
            return candidate;
          }
        }

        candidate = addDaysMs(candidate, 1);
      }

      return null;
    }

    case 'monthly': {
      if (!recurrence.dayOfMonth) {
        return null;
      }

      const nextMonth = addMonthsMs(normalized, recurrence.interval);
      const date = new Date(nextMonth);
      const validDay = getValidDayOfMonth(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        recurrence.dayOfMonth
      );

      return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), validDay);
    }

    case 'yearly':
      return addYearsMs(normalized, recurrence.interval);

    default:
      return null;
  }
}

/**
 * Interface for a task instance (minimal fields needed for generation)
 */
export interface TaskInstance {
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDateMs?: number;
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
    priority?: 'low' | 'medium' | 'high';
    dueDateMs?: number;
  }>;
  tagIds?: any[];
  recurringParentId: any;
  instanceDateMs: number;
  isCustomized: boolean;
}

/**
 * Generates recurring task instances from a parent task
 */
export function generateRecurrenceInstancesMs(
  parentTask: {
    id: any;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    subtasks?: Array<{
      id: string;
      title: string;
      completed: boolean;
      priority?: 'low' | 'medium' | 'high';
      dueDateMs?: number;
    }>;
    tagIds?: any[];
    recurrence: RecurrencePattern;
  },
  startTimestampMs: number = Date.now(),
  lookaheadDays: number = DEFAULT_LOOKAHEAD_DAYS
): TaskInstance[] {
  if (!parentTask.recurrence || !isValidRecurrence(parentTask.recurrence)) {
    return [];
  }

  const instances: TaskInstance[] = [];
  const normalizedStart = startOfDayMs(startTimestampMs);
  const endOfWindow = addDaysMs(normalizedStart, lookaheadDays);

  let currentTimestamp = getNextOccurrenceMs(parentTask.recurrence, normalizedStart);

  // For weekly recurrence, start from today if today matches the pattern
  if (parentTask.recurrence.frequency === 'weekly' && parentTask.recurrence.daysOfWeek) {
    const todayDayOfWeek = getDayOfWeek(normalizedStart);
    if (parentTask.recurrence.daysOfWeek.includes(todayDayOfWeek)) {
      currentTimestamp = normalizedStart;
    }
  }

  // For daily recurrence, include the start date
  if (parentTask.recurrence.frequency === 'daily') {
    currentTimestamp = normalizedStart;
  }

  // For monthly recurrence, include start date if it matches the dayOfMonth
  if (parentTask.recurrence.frequency === 'monthly' && parentTask.recurrence.dayOfMonth) {
    const date = new Date(normalizedStart);
    const startDayOfMonth = date.getUTCDate();
    if (startDayOfMonth === parentTask.recurrence.dayOfMonth) {
      currentTimestamp = normalizedStart;
    }
  }

  while (currentTimestamp && instances.length < MAX_RECURRENCE_INSTANCES) {
    // Check end date condition
    if (parentTask.recurrence.endDateMs && currentTimestamp > parentTask.recurrence.endDateMs) {
      break;
    }

    // Check count condition
    if (parentTask.recurrence.count && instances.length >= parentTask.recurrence.count) {
      break;
    }

    // Check if within lookahead window
    if (currentTimestamp > endOfWindow) {
      break;
    }

    // Create instance
    instances.push({
      title: parentTask.title,
      description: parentTask.description,
      completed: false,
      priority: parentTask.priority,
      dueDateMs: currentTimestamp,
      subtasks: parentTask.subtasks,
      tagIds: parentTask.tagIds,
      recurringParentId: parentTask.id,
      instanceDateMs: currentTimestamp,
      isCustomized: false,
    });

    // Get next occurrence
    currentTimestamp = getNextOccurrenceMs(parentTask.recurrence, currentTimestamp);
  }

  return instances;
}

/**
 * Checks if the lookahead window needs to be extended
 */
export function needsLookaheadExtensionMs(
  instances: Array<{ instanceDateMs?: number }>,
  currentTimestampMs: number,
  windowDays: number = DEFAULT_LOOKAHEAD_DAYS
): boolean {
  if (instances.length === 0) {
    return true;
  }

  const normalizedCurrent = startOfDayMs(currentTimestampMs);
  const latestInstance = instances.reduce((latest, instance) => {
    if (!instance.instanceDateMs) return latest;
    return instance.instanceDateMs > latest ? instance.instanceDateMs : latest;
  }, instances[0]?.instanceDateMs ?? normalizedCurrent);

  const daysDifference = differenceInDaysMs(latestInstance, normalizedCurrent);

  return daysDifference < windowDays;
}
