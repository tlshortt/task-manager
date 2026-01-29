# Phase 6: Cleanup

## Overview
Remove Dexie dependencies and clean up migration artifacts.

**Estimated time:** ~1 hour

## Tasks

### 6.1 Remove Dexie Dependencies

```bash
npm uninstall dexie dexie-react-hooks
npm uninstall -D fake-indexeddb
```

### 6.2 Delete Dexie Files
- Delete `src/db/index.ts`
- Delete `src/db/index.test.ts`
- Delete `src/db/` directory

### 6.3 Remove Migration Component
After sufficient time for users to migrate:
- Remove `src/components/DataMigration.tsx`
- Remove `convex/import.ts`
- Remove migration wrapper from `App.tsx`

### 6.4 Update Test Setup
Edit `src/test/setup.ts`:
- Remove `fake-indexeddb` import
- Remove Dexie-related mocks

Add Convex test mocks:
```ts
import { vi } from 'vitest';

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}));
```

### 6.5 Update Tests
For each test file:
- Remove Dexie database setup/teardown
- Mock `useQuery` return values
- Mock `useMutation` implementations

Example:
```ts
import { useQuery, useMutation } from 'convex/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('convex/react');

describe('TaskRow', () => {
  beforeEach(() => {
    vi.mocked(useQuery).mockReturnValue([/* mock tasks */]);
    vi.mocked(useMutation).mockReturnValue(vi.fn());
  });

  it('renders task', () => {
    // ...
  });
});
```

### 6.6 Update AGENTS.md
Remove Dexie references:
```diff
- Dexie (IndexedDB) + dexie-react-hooks
+ Convex (real-time backend)

- Factory: `createTodoDatabase()` → typed Dexie instance
+ Convex functions in `convex/` folder

- `fake-indexeddb` auto-imported in setup
+ Convex hooks mocked in tests
```

### 6.7 Update package.json Scripts
Add Convex dev script:
```json
{
  "scripts": {
    "dev": "vite",
    "dev:backend": "convex dev",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:backend\""
  }
}
```

Optional: `npm i -D concurrently`

### 6.8 Update README.md
- Update prerequisites (Convex account)
- Update quick start (add Convex setup)
- Update project structure (add `convex/` folder)
- Remove Dexie references

### 6.9 Clear IndexedDB (Optional)
Add utility to clear old data after migration:
```ts
// Run once after confirming migration success
indexedDB.deleteDatabase('todoApp');
```

## Files to Delete
- `src/db/index.ts`
- `src/db/index.test.ts`
- `src/db/` (directory)

## Files to Update
- `src/test/setup.ts`
- `src/hooks/useTasks.test.tsx`
- `src/hooks/useRecurringTasks.test.tsx`
- `AGENTS.md`
- `README.md`
- `package.json`

## Acceptance Criteria
- [ ] Dexie packages removed from package.json
- [ ] No Dexie imports in codebase
- [ ] Tests pass with Convex mocks
- [ ] `npm run build` succeeds
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] Documentation updated

## Dependencies
- Phase 5 complete (data migrated)
- Users have had time to migrate their data

## Notes
- Keep migration code for ~1-2 weeks before removing
- Consider adding analytics to track migration completion
- Old IndexedDB data persists until manually cleared
