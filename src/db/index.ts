import Dexie, { type Table } from 'dexie';
import type { Task } from '@/types';

/**
 * Dexie database for task management
 */
export class TodoDatabase extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    super('todoApp');

    this.version(1).stores({
      tasks: '++id, completed, priority, dueDate, createdAt'
    });
  }
}

export const db = new TodoDatabase();
