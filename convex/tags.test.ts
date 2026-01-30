import { create, list, remove } from "./tags";
import { createTestCtx } from "./testUtils";

type Handler<TArgs, TResult> = (ctx: { db: unknown }, args: TArgs) => Promise<TResult>;

const run = async <TArgs, TResult>(
  fn: { _handler: Handler<TArgs, TResult> },
  ctx: { db: unknown },
  args: TArgs
) => fn._handler(ctx, args);

describe("tags", () => {
  it("creates and lists tags", async () => {
    const ctx = createTestCtx();

    const id = await run(create, ctx, {
      name: "Work",
      color: "blue",
    });

    const tags = await run(list, ctx, {});

    expect(tags).toHaveLength(1);
    expect(tags[0]?._id).toBe(id);
    expect(tags[0]?.name).toBe("Work");
  });

  it("removes tags", async () => {
    const ctx = createTestCtx();

    const id = await run(create, ctx, {
      name: "Home",
      color: "green",
    });

    await run(remove, ctx, { id });

    const tags = await run(list, ctx, {});
    expect(tags).toHaveLength(0);
  });
});
