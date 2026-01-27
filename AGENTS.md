Be extremely concise in interactions and commit messages. Sacrifice grammar for brevity.

# AGENTS.md - Codebase Conventions

## Stack

- Vite + React 18 + TypeScript (strict)
- Tailwind CSS (dark mode via class)
- Dexie (IndexedDB) + dexie-react-hooks
- Vitest + React Testing Library
- lucide-react, date-fns, react-hot-toast

## Structure

```
src/
├── components/     # React components + tests
├── hooks/          # Custom hooks + tests
├── db/             # Dexie setup
├── types/          # All types in index.ts
├── utils/          # Pure functions + tests
├── test/setup.ts   # Vitest config, mocks
├── App.tsx, main.tsx, index.css

spec/               # prd.json, progress.txt, PROMPT.md
skills/             # prd/, ralph/, agent-browser/
tasks/              # prd-*.md files
```

## TypeScript

- Strict mode: `noUncheckedIndexedAccess`, no unused vars
- Implicit types unless ambiguous
- No `any` - use `unknown` and narrow
- `interface` for objects, `type` for unions
- Path alias: `@/` → `src/`
- Type imports: `import type { T }`

## Components

- Functional only, named exports (except App.tsx)
- Props interface before component, destructure in signature
- Icons from `lucide-react`

```typescript
interface ButtonProps {
  label: string
  onClick: () => void
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}
```

## Tailwind

- Dark mode: `dark:` classes
- Focus: `focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`
- Group hover: parent `group` + child `group-hover:opacity-100`
- Custom shadow: `shadow-card`
- Dynamic classes must be in `safelist`

## Hooks

- Return objects: `{ data, isLoading, action }`
- `useLiveQuery` for reactive DB queries
- Loading: `data === undefined`
- Toast with undo for destructive actions

```typescript
export function useTasks(): UseTasksReturn {
  const tasks = useLiveQuery(() => db.tasks.toArray());
  return { tasks: tasks ?? [], isLoading: tasks === undefined, addTask };
}
```

## Database

- Factory: `createTodoDatabase()` → typed Dexie instance
- Auto-increment: `++id`, indexed: `completed`, `priority`, `dueDate`
- Always update `updatedAt` on mutations

## Utils

- Pure functions, JSDoc comments
- `date-fns` for dates
- Store `Date` objects, format for display

## Testing

- Vitest globals: `describe`, `it`, `expect` (no imports)
- Co-located: `*.test.tsx` next to source
- `userEvent.setup()` for interactions
- `fake-indexeddb` auto-imported in setup
- Clear DB in `beforeEach`

## File Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.tsx`
- Utils: `camelCase.ts`
- Tests: `*.test.ts(x)`

## Skills

```
Load prd skill, create PRD for [feature]     → tasks/prd-*.md
Load ralph skill, convert tasks/prd-*.md     → spec/prd.json
```

## Gotchas

1. Dynamic Tailwind classes → add to `safelist`
2. Path alias `@/` only works in `src/`
3. Vitest globals - no imports needed
4. PRD stories must fit single Ralph iteration
5. Dark mode uses class strategy via `useDarkMode`

_Update when discovering new patterns._
