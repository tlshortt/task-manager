import Dexie, { type Table } from 'dexie';
import type { Task, Tag } from '@/types';

export function createTodoDatabase() {
  const db = new Dexie('todoApp');
  db.version(1).stores({
    tasks: '++id, completed, priority, dueDate, createdAt'
  });
  // v2: add subtasks and tags (stored as arrays, no index needed)
  db.version(2).stores({
    tasks: '++id, completed, priority, dueDate, createdAt',
    tags: '++id, name'
  });
  // v3: add recurring task indexes
  db.version(3).stores({
    tasks: '++id, completed, priority, dueDate, createdAt, recurringParentId, isRecurringParent',
    tags: '++id, name'
  });
  return db as Dexie & { tasks: Table<Task>; tags: Table<Tag> };
}

export const db = createTodoDatabase();
