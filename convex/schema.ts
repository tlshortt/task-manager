import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define the schema matching TypeScript types
const schema = defineSchema({
  tags: defineTable({
    name: v.string(),
    color: v.string(),
  }).index("by_name", ["name"]),

  tasks: defineTable({
    title: v.string(),
    completed: v.boolean(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    description: v.optional(v.string()),
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
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
    isRecurringParent: v.optional(v.boolean()),
    recurringParentId: v.optional(v.id("tasks")),
    instanceDateMs: v.optional(v.number()),
    isCustomized: v.optional(v.boolean()),
  })
    .index("by_completed", ["completed"])
    .index("by_dueDateMs", ["dueDateMs"])
    .index("by_recurringParentId", ["recurringParentId"])
    .index("by_isRecurringParent", ["isRecurringParent"]),
});

export default schema;
