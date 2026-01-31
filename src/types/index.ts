/**
 * Type definitions for the application
 */
import type { GenericId } from 'convex/values';

// Type alias for Convex ID
export type Id<T extends string> = GenericId<T>;

// Helper for test mocks - casts string to Id type
export const testId = <T extends string>(id: string): Id<T> => id as Id<T>;

export type Priority = 'low' | 'medium' | 'high';

export type FilterType = 'current' | 'overdue' | 'completed';

export type ViewMode = 'list' | 'calendar';

export type RecurrenceFilter =
  | 'all'
  | 'recurring'
  | 'non-recurring'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly';

export type CategoryFilter = 'all' | 'uncategorized' | Id<'tags'>;

export type PriorityFilter = 'all' | Priority;

export interface TaskFilters {
  recurrence: RecurrenceFilter;
  category: CategoryFilter;
  priority: PriorityFilter;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  priority?: Priority;
  dueDate?: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string; // tailwind color like 'blue', 'green', 'red'
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // 1 = every occurrence, 2 = every other, etc.
  daysOfWeek?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat (for weekly)
  dayOfMonth?: number; // 1-31 (for monthly)
  endDate?: Date;
  count?: number; // max instances
}

export interface Task {
  id?: Id<'tasks'>;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: Date;
  subtasks?: Subtask[];
  tagIds?: Id<'tags'>[];
  createdAt: Date;
  updatedAt: Date;
  isRecurringParent?: boolean;
  recurringParentId?: Id<'tasks'>;
  recurrence?: RecurrencePattern;
  instanceDate?: Date;
  isCustomized?: boolean;
}
