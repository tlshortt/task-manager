import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Task, Id } from '@/types';
import { mapTaskDocToTask } from '@/utils/convexMappers';

export function useRecurringTasks() {
  // Convex mutations
  const deleteSeriesMutation = useMutation(api.tasks.deleteSeries);
  const updateSeriesMutation = useMutation(api.tasks.updateSeries);
  const generateInstancesMutation = useMutation(api.tasks.generateInstances);

  // Query for tasks to check lookahead window
  const taskDocs = useQuery(api.tasks.list);
  const tasks = taskDocs?.map(mapTaskDocToTask);

  const deleteRecurringSeries = async (parentId: Id<'tasks'>): Promise<void> => {
    await deleteSeriesMutation({ parentId });
  };

  const updateRecurringSeries = async (
    parentId: Id<'tasks'>,
    updates: Partial<Task>
  ): Promise<void> => {
    // Extract only the fields that can be updated in a series
    const seriesUpdates: any = {};

    if (updates.title !== undefined) seriesUpdates.title = updates.title;
    if (updates.description !== undefined) seriesUpdates.description = updates.description;
    if (updates.priority !== undefined) seriesUpdates.priority = updates.priority;
    if (updates.subtasks !== undefined) {
      seriesUpdates.subtasks = updates.subtasks?.map((st) => ({
        id: st.id,
        title: st.title,
        completed: st.completed,
        priority: st.priority,
        dueDateMs: st.dueDate ? st.dueDate.getTime() : undefined,
      }));
    }
    if (updates.tagIds !== undefined) seriesUpdates.tagIds = updates.tagIds;

    await updateSeriesMutation({
      parentId,
      updates: seriesUpdates,
    });
  };

  const extendLookaheadWindow = async (): Promise<void> => {
    if (!tasks) return;

    // Find all recurring parent tasks
    const parents = tasks.filter((t: Task) => t.isRecurringParent === true);

    for (const parent of parents) {
      if (!parent.id) continue;

      // Get instances for this parent
      const instances = tasks.filter((t: Task) => t.recurringParentId === parent.id);

      // Check if lookahead extension is needed
      const lookaheadDays = 90;
      const now = new Date();
      const lookaheadDate = new Date(now.getTime() + lookaheadDays * 24 * 60 * 60 * 1000);

      // Find the latest instance date
      const latestInstance = instances.reduce((latest: Date, inst: Task) => {
        if (!inst.instanceDate) return latest;
        return inst.instanceDate > latest ? inst.instanceDate : latest;
      }, instances[0]?.instanceDate ?? now);

      // If latest instance is within 30 days of lookahead window, extend it
      if (latestInstance < new Date(lookaheadDate.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        await generateInstancesMutation({
          parentId: parent.id,
          lookaheadDays,
        });
      }
    }
  };

  return {
    deleteRecurringSeries,
    updateRecurringSeries,
    extendLookaheadWindow,
  };
}
