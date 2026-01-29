import { db } from '@/db';
import type { Task } from '@/types';
import {
  generateInstancesForParent,
  deleteRecurringSeries,
  updateRecurringSeries,
  extendLookaheadWindow,
} from './useRecurringTasks';

describe('useRecurringTasks', () => {
  const createParentTask = async (): Promise<number> => {
    return await db.tasks.add({
      title: 'Parent Task',
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      isRecurringParent: true,
      recurrence: {
        frequency: 'daily',
        interval: 1,
      },
    } as Task);
  };

  const createInstance = async (parentId: number, instanceDate: Date): Promise<number> => {
    return await db.tasks.add({
      title: 'Instance Task',
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      recurringParentId: parentId,
      instanceDate,
      dueDate: instanceDate,
    } as Task);
  };

  beforeEach(async () => {
    await db.tasks.clear();
  });

  describe('generateInstancesForParent', () => {
    it('generates instances for a parent task', async () => {
      const parentId = await createParentTask();
      const count = await generateInstancesForParent(parentId);
      expect(count).toBeGreaterThan(0);

      const instances = await db.tasks.where('recurringParentId').equals(parentId).toArray();
      expect(instances.length).toBeGreaterThan(0);
    });

    it('returns 0 for non-existent parent', async () => {
      const count = await generateInstancesForParent(9999);
      expect(count).toBe(0);
    });

    it('returns 0 for non-recurring task', async () => {
      const regularId = await db.tasks.add({
        title: 'Regular Task',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Task);

      const count = await generateInstancesForParent(regularId);
      expect(count).toBe(0);
    });
  });

  describe('deleteRecurringSeries', () => {
    it('deletes parent and all instances', async () => {
      const parentId = await createParentTask();
      await createInstance(parentId, new Date());
      await createInstance(parentId, new Date(Date.now() + 86400000));

      const beforeDelete = await db.tasks.count();
      expect(beforeDelete).toBe(3); // 1 parent + 2 instances

      await deleteRecurringSeries(parentId);

      const afterDelete = await db.tasks.count();
      expect(afterDelete).toBe(0);
    });
  });

  describe('updateRecurringSeries', () => {
    it('updates parent and future non-customized instances', async () => {
      const parentId = await createParentTask();
      const futureDate = new Date(Date.now() + 86400000 * 7);
      await createInstance(parentId, futureDate);

      await updateRecurringSeries(parentId, { title: 'Updated Title' });

      const parent = await db.tasks.get(parentId);
      expect(parent?.title).toBe('Updated Title');

      const instances = await db.tasks.where('recurringParentId').equals(parentId).toArray();
      const futureInstance = instances[0];
      expect(futureInstance?.title).toBe('Updated Title');
    });

    it('does not update customized instances', async () => {
      const parentId = await createParentTask();
      const futureDate = new Date(Date.now() + 86400000 * 7);
      const instanceId = await createInstance(parentId, futureDate);
      await db.tasks.update(instanceId, { isCustomized: true });

      await updateRecurringSeries(parentId, { title: 'Updated Title' });

      const instance = await db.tasks.get(instanceId);
      expect(instance?.title).toBe('Instance Task'); // Unchanged
    });
  });

  describe('extendLookaheadWindow', () => {
    it('runs without errors when no parents exist', async () => {
      await expect(extendLookaheadWindow()).resolves.not.toThrow();
    });

    it('extends window for recurring parents that need it', async () => {
      const parentId = await createParentTask();

      await extendLookaheadWindow();

      const instances = await db.tasks.where('recurringParentId').equals(parentId).toArray();
      expect(instances.length).toBeGreaterThan(0);
    });
  });
});
