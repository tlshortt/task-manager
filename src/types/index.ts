/**
 * Type definitions for the application
 */
import type { GenericId } from 'convex/values';

// Type alias for Convex ID
export type Id<T extends string> = GenericId<T>;

export type Priority = 'low' | 'medium' | 'high';

export type FilterType = 'current' | 'overdue' | 'completed';

export type ViewMode = 'list' | 'calendar';

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
