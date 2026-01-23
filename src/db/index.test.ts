import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from './index';
import type { Task } from '@/types';

describe('TodoDatabase', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.tasks.clear();
  });

  afterEach(async () => {
    // Clean up after tests
    await db.tasks.clear();
  });

  it('opens database successfully', async () => {
    expect(db.isOpen()).toBe(true);
    expect(db.name).toBe('todoApp');
  });

  it('tasks table exists', () => {
    expect(db.tasks).toBeDefined();
    expect(db.tasks.name).toBe('tasks');
  });

  it('can add and retrieve a task', async () => {
    const task: Task = {
      title: 'Test Task',
      description: 'Test description',
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await db.tasks.add(task);
    expect(id).toBeTypeOf('number');

    const retrieved = await db.tasks.get(id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Test Task');
  });

  it('completed index works', async () => {
    await db.tasks.bulkAdd([
      {
        title: 'Completed Task',
        completed: true,
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Incomplete Task',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const completedTasks = await db.tasks.filter(t => t.completed === true).toArray();
    expect(completedTasks.length).toBe(1);
    expect(completedTasks[0]?.title).toBe('Completed Task');
  });

  it('priority index works', async () => {
    await db.tasks.bulkAdd([
      {
        title: 'High Priority',
        completed: false,
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Low Priority',
        completed: false,
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const highPriorityTasks = await db.tasks.where('priority').equals('high').toArray();
    expect(highPriorityTasks.length).toBe(1);
    expect(highPriorityTasks[0]?.title).toBe('High Priority');
  });

  it('dueDate index works', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await db.tasks.bulkAdd([
      {
        title: 'Task with due date',
        completed: false,
        priority: 'medium',
        dueDate: tomorrow,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Task without due date',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const tasksWithDueDate = await db.tasks.where('dueDate').above(new Date()).toArray();
    expect(tasksWithDueDate.length).toBe(1);
    expect(tasksWithDueDate[0]?.title).toBe('Task with due date');
  });

  it('createdAt index works', async () => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago

    await db.tasks.bulkAdd([
      {
        title: 'Older Task',
        completed: false,
        priority: 'medium',
        createdAt: earlier,
        updatedAt: earlier
      },
      {
        title: 'Newer Task',
        completed: false,
        priority: 'medium',
        createdAt: now,
        updatedAt: now
      }
    ]);

    const recentTasks = await db.tasks.where('createdAt').above(earlier).toArray();
    expect(recentTasks.length).toBe(1);
    expect(recentTasks[0]?.title).toBe('Newer Task');
  });
});
