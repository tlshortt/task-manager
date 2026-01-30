import type { GenericId } from "convex/values";

type TableName = "tasks" | "tags";

type Doc = Record<string, unknown> & {
  _id: GenericId<TableName>;
  _creationTime: number;
};

export interface FakeDb {
  get: (id: GenericId<TableName>) => Promise<Doc | null>;
  insert: (table: TableName, value: Record<string, unknown>) => Promise<GenericId<TableName>>;
  patch: (id: GenericId<TableName>, updates: Record<string, unknown>) => Promise<void>;
  delete: (id: GenericId<TableName>) => Promise<void>;
  query: (table: TableName) => {
    collect: () => Promise<Doc[]>;
    withIndex: (
      _indexName: string,
      fn: (q: { eq: (field: string, value: unknown) => { field: string; value: unknown } }) => {
        field: string;
        value: unknown;
      }
    ) => { collect: () => Promise<Doc[]> };
  };
}

export interface TestCtx {
  db: FakeDb;
}

export function createFakeDb(): FakeDb {
  const tables: Record<TableName, Map<string, Doc>> = {
    tasks: new Map(),
    tags: new Map(),
  };
  const counters: Record<TableName, number> = {
    tasks: 0,
    tags: 0,
  };

  const findTableById = (id: GenericId<TableName>) => {
    if (tables.tasks.has(id)) return "tasks";
    if (tables.tags.has(id)) return "tags";
    return null;
  };

  return {
    get: async (id) => {
      const table = findTableById(id);
      return table ? tables[table].get(id) ?? null : null;
    },
    insert: async (table, value) => {
      const nextId = `${table}-${++counters[table]}` as GenericId<TableName>;
      const doc: Doc = {
        ...value,
        _id: nextId,
        _creationTime: Date.now(),
      };
      tables[table].set(nextId, doc);
      return nextId;
    },
    patch: async (id, updates) => {
      const table = findTableById(id);
      if (!table) {
        throw new Error("Document not found");
      }
      const current = tables[table].get(id);
      if (!current) {
        throw new Error("Document not found");
      }
      const next = {
        ...current,
        ...updates,
      } as Doc;
      tables[table].set(id, next);
    },
    delete: async (id) => {
      const table = findTableById(id);
      if (!table) {
        return;
      }
      tables[table].delete(id);
    },
    query: (table) => ({
      collect: async () => Array.from(tables[table].values()),
      withIndex: (_indexName, fn) => {
        const filter = fn({
          eq: (field, value) => ({ field, value }),
        });
        return {
          collect: async () =>
            Array.from(tables[table].values()).filter(
              (doc) => doc[filter.field] === filter.value
            ),
        };
      },
    }),
  };
}

export function createTestCtx(): TestCtx {
  return { db: createFakeDb() };
}
