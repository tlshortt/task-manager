import { create, deleteSeries, generateInstances, list, remove, toggleComplete, update, updateSeries } from "./tasks";
import { createTestCtx } from "./testUtils";

type Handler<TArgs, TResult> = (ctx: { db: unknown }, args: TArgs) => Promise<TResult>;

const run = async <TArgs, TResult>(
  fn: { _handler: Handler<TArgs, TResult> },
  ctx: { db: unknown },
  args: TArgs
) => fn._handler(ctx, args);

describe("tasks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-30T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates and lists tasks", async () => {
    const ctx = createTestCtx();

    const id = await run(create, ctx, {
      title: "Task A",
      completed: false,
      priority: "low",
    });

    const tasks = await run(list, ctx, {});

    expect(tasks).toHaveLength(1);
    expect(tasks[0]?._id).toBe(id);
    expect(tasks[0]?.createdAtMs).toBe(Date.now());
  });

  it("sets isRecurringParent when recurrence is provided", async () => {
    const ctx = createTestCtx();

    const id = await run(create, ctx, {
      title: "Recurring",
      completed: false,
      priority: "medium",
      recurrence: {
        frequency: "daily",
        interval: 1,
      },
    });

    const task = await ctx.db.get(id);
    expect(task?.isRecurringParent).toBe(true);
  });

  it("updates tasks and refreshes updatedAtMs", async () => {
    const ctx = createTestCtx();

    const id = await run(create, ctx, {
      title: "Before",
      completed: false,
      priority: "high",
    });

    vi.setSystemTime(new Date("2026-01-30T01:00:00.000Z"));

    await run(update, ctx, {
      id,
      title: "After",
    });

    const task = await ctx.db.get(id);
    expect(task?.title).toBe("After");
    expect(task?.updatedAtMs).toBe(Date.now());
  });

  it("removes tasks and returns the deleted task", async () => {
    const ctx = createTestCtx();

    const id = await run(create, ctx, {
      title: "Delete me",
      completed: false,
      priority: "medium",
    });

    const deleted = await run(remove, ctx, { id });

    expect(deleted?._id).toBe(id);
    expect(await ctx.db.get(id)).toBeNull();
  });

  it("toggles completion and returns previous value", async () => {
    const ctx = createTestCtx();

    const id = await run(create, ctx, {
      title: "Toggle",
      completed: false,
      priority: "low",
    });

    const oldCompleted = await run(toggleComplete, ctx, { id });
    const task = await ctx.db.get(id);

    expect(oldCompleted).toBe(false);
    expect(task?.completed).toBe(true);
  });

  it("deletes a recurring series and its instances", async () => {
    const ctx = createTestCtx();

    const parentId = await ctx.db.insert("tasks", {
      title: "Parent",
      completed: false,
      priority: "low",
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    });

    const instanceA = await ctx.db.insert("tasks", {
      title: "Instance A",
      completed: false,
      priority: "low",
      recurringParentId: parentId,
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    });

    const instanceB = await ctx.db.insert("tasks", {
      title: "Instance B",
      completed: false,
      priority: "low",
      recurringParentId: parentId,
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    });

    await run(deleteSeries, ctx, { parentId });

    expect(await ctx.db.get(parentId)).toBeNull();
    expect(await ctx.db.get(instanceA)).toBeNull();
    expect(await ctx.db.get(instanceB)).toBeNull();
  });

  it("updates parent and future non-customized instances in a series", async () => {
    const ctx = createTestCtx();
    const now = Date.now();

    const parentId = await ctx.db.insert("tasks", {
      title: "Parent",
      completed: false,
      priority: "low",
      createdAtMs: now,
      updatedAtMs: now,
    });

    const pastInstance = await ctx.db.insert("tasks", {
      title: "Past",
      completed: false,
      priority: "low",
      recurringParentId: parentId,
      instanceDateMs: now - 24 * 60 * 60 * 1000,
      isCustomized: false,
      createdAtMs: now,
      updatedAtMs: now,
    });

    const futureInstance = await ctx.db.insert("tasks", {
      title: "Future",
      completed: false,
      priority: "low",
      recurringParentId: parentId,
      instanceDateMs: now + 24 * 60 * 60 * 1000,
      isCustomized: false,
      createdAtMs: now,
      updatedAtMs: now,
    });

    const customizedInstance = await ctx.db.insert("tasks", {
      title: "Customized",
      completed: false,
      priority: "low",
      recurringParentId: parentId,
      instanceDateMs: now + 48 * 60 * 60 * 1000,
      isCustomized: true,
      createdAtMs: now,
      updatedAtMs: now,
    });

    await run(updateSeries, ctx, {
      parentId,
      updates: {
        title: "Updated",
      },
    });

    const parent = await ctx.db.get(parentId);
    const past = await ctx.db.get(pastInstance);
    const future = await ctx.db.get(futureInstance);
    const customized = await ctx.db.get(customizedInstance);

    expect(parent?.title).toBe("Updated");
    expect(future?.title).toBe("Updated");
    expect(future?.updatedAtMs).toBe(now);
    expect(past?.title).toBe("Past");
    expect(customized?.title).toBe("Customized");
  });

  it("generates instances from recurring parent", async () => {
    const ctx = createTestCtx();

    const parentId = await ctx.db.insert("tasks", {
      title: "Recurring",
      completed: false,
      priority: "medium",
      recurrence: {
        frequency: "daily",
        interval: 1,
        count: 3,
      },
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    });

    const result = await run(generateInstances, ctx, {
      parentId,
      lookaheadDays: 30,
    });

    const tasks = await run(list, ctx, {});
    const instances = tasks.filter((task) => task.recurringParentId === parentId);

    expect(result.count).toBe(3);
    expect(instances).toHaveLength(3);
    expect(instances.every((task) => task.instanceDateMs)).toBe(true);
  });
});
