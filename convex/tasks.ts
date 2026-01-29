import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { generateRecurrenceInstancesMs } from "./recurrenceUtils";

/**
 * Query to list all tasks
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

/**
 * Mutation to create a new task
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    dueDateMs: v.optional(v.number()),
    subtasks: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          completed: v.boolean(),
          priority: v.optional(
            v.union(
              v.literal("low"),
              v.literal("medium"),
              v.literal("high")
            )
          ),
          dueDateMs: v.optional(v.number()),
        })
      )
    ),
    tagIds: v.optional(v.array(v.id("tags"))),
    recurrence: v.optional(
      v.object({
        frequency: v.union(
          v.literal("daily"),
          v.literal("weekly"),
          v.literal("monthly"),
          v.literal("yearly")
        ),
        interval: v.number(),
        daysOfWeek: v.optional(v.array(v.number())),
        dayOfMonth: v.optional(v.number()),
        endDateMs: v.optional(v.number()),
        count: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const taskData = {
      ...args,
      createdAtMs: now,
      updatedAtMs: now,
      // Set isRecurringParent if recurrence is provided
      isRecurringParent: args.recurrence ? true : undefined,
    };

    return await ctx.db.insert("tasks", taskData);
  },
});

/**
 * Mutation to update an existing task
 */
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      )
    ),
    dueDateMs: v.optional(v.number()),
    subtasks: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          completed: v.boolean(),
          priority: v.optional(
            v.union(
              v.literal("low"),
              v.literal("medium"),
              v.literal("high")
            )
          ),
          dueDateMs: v.optional(v.number()),
        })
      )
    ),
    tagIds: v.optional(v.array(v.id("tags"))),
    isCustomized: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAtMs: Date.now(),
    });
  },
});

/**
 * Mutation to remove a task
 */
export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // Retrieve task before deletion for undo support
    const task = await ctx.db.get(args.id);

    if (!task) {
      throw new Error("Task not found");
    }

    await ctx.db.delete(args.id);

    // Return the deleted task for undo functionality
    return task;
  },
});

/**
 * Mutation to toggle task completion status
 */
export const toggleComplete = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);

    if (!task) {
      throw new Error("Task not found");
    }

    const oldCompleted = task.completed;

    await ctx.db.patch(args.id, {
      completed: !task.completed,
      updatedAtMs: Date.now(),
    });

    // Return old completion status for undo
    return oldCompleted;
  },
});

/**
 * Mutation to delete all instances of a recurring task series
 */
export const deleteSeries = mutation({
  args: {
    parentId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // Query all instances with the parent ID
    const instances = await ctx.db
      .query("tasks")
      .withIndex("by_recurringParentId", (q) =>
        q.eq("recurringParentId", args.parentId as any)
      )
      .collect();

    // Delete all instances
    for (const instance of instances) {
      await ctx.db.delete(instance._id);
    }

    // Delete parent task
    await ctx.db.delete(args.parentId);
  },
});

/**
 * Mutation to update recurring task series
 * Updates the parent and all future non-customized instances
 */
export const updateSeries = mutation({
  args: {
    parentId: v.id("tasks"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      priority: v.optional(
        v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high")
        )
      ),
      subtasks: v.optional(
        v.array(
          v.object({
            id: v.string(),
            title: v.string(),
            completed: v.boolean(),
            priority: v.optional(
              v.union(
                v.literal("low"),
                v.literal("medium"),
                v.literal("high")
              )
            ),
            dueDateMs: v.optional(v.number()),
          })
        )
      ),
      tagIds: v.optional(v.array(v.id("tags"))),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Update parent task
    await ctx.db.patch(args.parentId, {
      ...args.updates,
      updatedAtMs: now,
    });

    // Query all instances
    const instances = await ctx.db
      .query("tasks")
      .withIndex("by_recurringParentId", (q) =>
        q.eq("recurringParentId", args.parentId as any)
      )
      .collect();

    // Update only future instances that are not customized
    for (const instance of instances) {
      const isFuture = instance.instanceDateMs && instance.instanceDateMs >= now;
      const isNotCustomized = !instance.isCustomized;

      if (isFuture && isNotCustomized) {
        await ctx.db.patch(instance._id, {
          ...args.updates,
          updatedAtMs: now,
        });
      }
    }
  },
});

/**
 * Mutation to generate recurring task instances
 */
export const generateInstances = mutation({
  args: {
    parentId: v.id("tasks"),
    lookaheadDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const parentTask = await ctx.db.get(args.parentId);

    if (!parentTask) {
      throw new Error("Parent task not found");
    }

    if (!parentTask.recurrence) {
      throw new Error("Task is not a recurring task");
    }

    // Generate instances using recurrence utility functions
    const instances = generateRecurrenceInstancesMs(
      {
        id: parentTask._id,
        title: parentTask.title,
        description: parentTask.description,
        priority: parentTask.priority,
        subtasks: parentTask.subtasks,
        tagIds: parentTask.tagIds,
        recurrence: parentTask.recurrence,
      },
      Date.now(),
      args.lookaheadDays ?? 90
    );

    // Insert instances into the database
    const insertedIds = [];
    const now = Date.now();

    for (const instance of instances) {
      const id = await ctx.db.insert("tasks", {
        title: instance.title,
        description: instance.description,
        completed: instance.completed,
        priority: instance.priority,
        dueDateMs: instance.dueDateMs,
        subtasks: instance.subtasks,
        tagIds: instance.tagIds,
        recurringParentId: parentTask._id as any,
        instanceDateMs: instance.instanceDateMs,
        isCustomized: instance.isCustomized,
        createdAtMs: now,
        updatedAtMs: now,
      });
      insertedIds.push(id);
    }

    return { count: insertedIds.length, ids: insertedIds };
  },
});
