/**
 * Type definitions for the application
 */

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

export interface Task {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: Date;
  subtasks?: Subtask[];
  tags?: Tag[];
  createdAt: Date;
  updatedAt: Date;
}
