/**
 * Type mappers to convert between Convex Doc types and application Task types
 */
import type { GenericId } from 'convex/values';
import type { DocumentByName } from 'convex/server';
import type { DataModel } from '../../convex/_generated/dataModel';
import type { Task, Subtask, RecurrencePattern } from '@/types';

type ConvexTask = DocumentByName<DataModel, 'tasks'>;
type Id<T extends string> = GenericId<T>;

/**
 * Convert a Convex subtask object to application Subtask type
 */
export function mapSubtaskDocToSubtask(
  subtask: {
    id: string;
    title: string;
    completed: boolean;
    priority?: 'low' | 'medium' | 'high';
    dueDateMs?: number;
  }
): Subtask {
  return {
    id: subtask.id,
    title: subtask.title,
    completed: subtask.completed,
    priority: subtask.priority,
    dueDate: subtask.dueDateMs ? new Date(subtask.dueDateMs) : undefined,
  };
}

/**
 * Convert a Convex recurrence object to application RecurrencePattern type
 */
export function mapRecurrenceDocToPattern(
  recurrence: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDateMs?: number;
    count?: number;
  }
): RecurrencePattern {
  return {
    frequency: recurrence.frequency,
    interval: recurrence.interval,
    daysOfWeek: recurrence.daysOfWeek,
    dayOfMonth: recurrence.dayOfMonth,
    endDate: recurrence.endDateMs ? new Date(recurrence.endDateMs) : undefined,
    count: recurrence.count,
  };
}

/**
 * Convert a Convex task document to application Task type
 */
export function mapTaskDocToTask(doc: ConvexTask): Task {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    completed: doc.completed,
    priority: doc.priority,
    dueDate: doc.dueDateMs ? new Date(doc.dueDateMs) : undefined,
    subtasks: doc.subtasks?.map(mapSubtaskDocToSubtask),
    tagIds: doc.tagIds,
    createdAt: new Date(doc.createdAtMs),
    updatedAt: new Date(doc.updatedAtMs),
    isRecurringParent: doc.isRecurringParent,
    recurringParentId: doc.recurringParentId as unknown as Id<'tasks'> | undefined,
    recurrence: doc.recurrence ? mapRecurrenceDocToPattern(doc.recurrence) : undefined,
    instanceDate: doc.instanceDateMs ? new Date(doc.instanceDateMs) : undefined,
    isCustomized: doc.isCustomized,
  };
}

/**
 * Convert application Subtask to Convex subtask args
 */
function mapSubtaskToArgs(subtask: Subtask) {
  return {
    id: subtask.id,
    title: subtask.title,
    completed: subtask.completed,
    priority: subtask.priority,
    dueDateMs: subtask.dueDate ? subtask.dueDate.getTime() : undefined,
  };
}

/**
 * Convert application RecurrencePattern to Convex recurrence args
 */
function mapRecurrenceToArgs(recurrence: RecurrencePattern) {
  return {
    frequency: recurrence.frequency,
    interval: recurrence.interval,
    daysOfWeek: recurrence.daysOfWeek,
    dayOfMonth: recurrence.dayOfMonth,
    endDateMs: recurrence.endDate ? recurrence.endDate.getTime() : undefined,
    count: recurrence.count,
  };
}

/**
 * Convert application Task to Convex mutation args for create/update operations
 * Omits id, createdAt, updatedAt as these are managed by Convex
 */
export function mapTaskToArgs(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): {
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
  tagIds?: Id<'tags'>[];
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDateMs?: number;
    count?: number;
  };
} {
  return {
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    dueDateMs: task.dueDate ? task.dueDate.getTime() : undefined,
    subtasks: task.subtasks?.map(mapSubtaskToArgs),
    tagIds: task.tagIds,
    recurrence: task.recurrence ? mapRecurrenceToArgs(task.recurrence) : undefined,
  };
}
