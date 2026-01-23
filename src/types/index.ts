/**
 * Type definitions for the application
 */

export type Priority = 'low' | 'medium' | 'high';

export type FilterType = 'current' | 'overdue' | 'completed';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: Date;
  estimatedMinutes?: number;
  consumedMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}
