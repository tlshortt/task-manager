import { db } from '@/db';
import type { Task } from '@/types';
import { generateRecurrenceInstances, needsLookaheadExtension } from '@/utils/recurrenceUtils';
import { DEFAULT_LOOKAHEAD_DAYS } from '@/constants/recurrence';

export async function generateInstancesForParent(parentId: number): Promise<number> {
  const parent = await db.tasks.get(parentId);
  if (!parent?.recurrence || !parent.isRecurringParent) {
    return 0;
  }

  // Get existing instances to find the latest date
  const existingInstances = await db.tasks
    .where('recurringParentId')
    .equals(parentId)
    .toArray();

  // Find the latest instance date to continue from
  let startDate = new Date();
  if (existingInstances.length > 0) {
    const latestInstance = existingInstances.reduce((latest, inst) => {
      if (!inst.instanceDate) return latest;
      return inst.instanceDate > latest ? inst.instanceDate : latest;
    }, existingInstances[0]?.instanceDate ?? new Date());
    startDate = latestInstance;
  }

  const newInstances = generateRecurrenceInstances(parent, startDate, DEFAULT_LOOKAHEAD_DAYS);
  
  if (newInstances.length > 0) {
    await db.tasks.bulkAdd(newInstances as Task[]);
  }
  
  return newInstances.length;
}

export async function extendLookaheadWindow(): Promise<void> {
  // Filter for recurring parents - query all and filter in memory
  // since indexed boolean behavior varies
  const allTasks = await db.tasks.toArray();
  const parents = allTasks.filter(t => t.isRecurringParent === true);

  for (const parent of parents) {
    if (!parent.id) continue;
    
    const instances = await db.tasks
      .where('recurringParentId')
      .equals(parent.id)
      .toArray();
    
    if (needsLookaheadExtension(instances, new Date(), DEFAULT_LOOKAHEAD_DAYS)) {
      await generateInstancesForParent(parent.id);
    }
  }
}

export async function deleteRecurringSeries(parentId: number): Promise<void> {
  // Delete all instances
  await db.tasks
    .where('recurringParentId')
    .equals(parentId)
    .delete();
  
  // Delete parent
  await db.tasks.delete(parentId);
}

export async function updateRecurringSeries(
  parentId: number, 
  updates: Partial<Task>
): Promise<void> {
  // Update parent
  await db.tasks.update(parentId, {
    ...updates,
    updatedAt: new Date(),
  });

  // Update future non-customized instances
  const now = new Date();
  const instances = await db.tasks
    .where('recurringParentId')
    .equals(parentId)
    .toArray();

  const futureInstances = instances.filter(
    (inst) => inst.instanceDate && inst.instanceDate >= now && !inst.isCustomized
  );

  for (const instance of futureInstances) {
    if (instance.id) {
      await db.tasks.update(instance.id, {
        ...updates,
        updatedAt: new Date(),
      });
    }
  }
}
