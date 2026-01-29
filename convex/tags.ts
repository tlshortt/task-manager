import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Query to list all tags
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tags").collect();
  },
});

/**
 * Mutation to create a new tag
 */
export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tags", args);
  },
});

/**
 * Mutation to remove a tag
 */
export const remove = mutation({
  args: {
    id: v.id("tags"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
