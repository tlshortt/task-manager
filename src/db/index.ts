import Dexie, { type Table } from 'dexie';
import type { Task } from '@/types';

export function createTodoDatabase() {
  const db = new Dexie('todoApp');
  db.version(1).stores({
    tasks: '++id, completed, priority, dueDate, createdAt'
  });
  return db as Dexie & { tasks: Table<Task> };
}

export const db = createTodoDatabase();
