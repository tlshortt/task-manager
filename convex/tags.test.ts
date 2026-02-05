import { create, list, remove } from "./tags";
import { createTestCtx, runHandler } from "./testUtils";

describe("tags", () => {
  it("creates and lists tags", async () => {
    const ctx = createTestCtx();

    const id = await runHandler(create, ctx, {
      name: "Work",
      color: "blue",
    });

    const tags = await runHandler(list, ctx, {});

    expect(tags).toHaveLength(1);
    expect(tags[0]?._id).toBe(id);
    expect(tags[0]?.name).toBe("Work");
  });

  it("removes tags", async () => {
    const ctx = createTestCtx();

    const id = await runHandler(create, ctx, {
      name: "Home",
      color: "green",
    });

    await runHandler(remove, ctx, { id });

    const tags = await runHandler(list, ctx, {});
    expect(tags).toHaveLength(0);
  });
});
