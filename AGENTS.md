In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

# AGENTS.md - Codebase Conventions

This file documents patterns and conventions for AI coding agents (and human developers) working in this codebase.

## Project Overview

A simple task management application built with:

- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Vitest** - Testing framework

## Directory Structure

```
src/
├── components/     # React components
│   ├── index.ts    # Barrel exports
│   └── *.tsx       # Component files
├── types/          # TypeScript type definitions
│   └── index.ts    # All types exported here
├── utils/          # Utility functions
│   └── *.ts        # Pure functions, helpers
├── test/           # Test setup
│   └── setup.ts    # Vitest configuration
├── App.tsx         # Root component
├── main.tsx        # Entry point
└── index.css       # Global styles + Tailwind

scripts/ralph/      # Ralph loop scripts
├── ralph.sh        # Main loop script
├── ralph-once.sh   # Single iteration script
└── ralph-status.sh # Status checker

spec/               # Ralph specification files
├── prd.json        # Product requirements
├── progress.txt    # Progress tracking
└── PROMPT.md       # AI agent instructions

skills/             # AI agent skills (reusable prompts)
├── prd/            # PRD Generator skill
│   └── SKILL.md    # Conversational PRD creation
└── ralph/          # Ralph PRD Converter skill
    └── SKILL.md    # Convert PRD markdown to prd.json

tasks/              # Generated PRD documents
└── prd-*.md        # PRDs created by the prd skill
```

## Code Conventions

### TypeScript

- **Favor implicit types when possible:** Only explicity type function parameters and return values when it is ambiguous
- **No `any`:** Use `unknown` if type is truly unknown, then narrow
- **Interfaces over types:** Prefer `interface` for object shapes
- **Path aliases:** Use `@/` to import from `src/`

```typescript
// ✅ Good
import type { Task } from "@/types";

function getTask(id: string): Task | undefined {
  // ...
}

// ❌ Bad
function getTask(id): any {
  // ...
}
```

### React Components

- **Functional components only:** No class components
- **Props interface:** Define props with explicit interface
- **Destructure props:** In function signature
- **Export named:** Use named exports, not default (except App.tsx)

```typescript
// ✅ Good
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}
```

### Styling with Tailwind

- **Utility classes:** Prefer Tailwind utilities over custom CSS
- **Component classes:** Use `@layer components` in `index.css` for reusable patterns
- **Dynamic classes:** Use template literals, ensure classes are in safelist
- **Consistent spacing:** Use Tailwind's spacing scale (4, 8, 12, 16...)

```typescript
// ✅ Good - explicit classes
<div className="bg-red-100 text-red-700">High priority</div>

// ❌ Bad - dynamic class construction (won't be in CSS bundle)
<div className={`bg-${color}-100`}>...</div>
```

### File Naming

- **Components:** `PascalCase.tsx` (e.g., `TaskCard.tsx`)
- **Utilities:** `camelCase.ts` (e.g., `priority.ts`)
- **Tests:** `*.test.ts` or `*.test.tsx`
- **Types:** Defined in `types/index.ts`

### Testing

- **Test files:** Co-locate with source or in `__tests__/`
- **Naming:** `describe` → component/function name, `it` → behavior
- **React Testing Library:** For component tests

```typescript
// src/utils/priority.test.ts
import { describe, it, expect } from "vitest";
import { getPriorityLabel } from "./priority";

describe("getPriorityLabel", () => {
  it('returns "High" for high priority', () => {
    expect(getPriorityLabel("high")).toBe("High");
  });
});
```

## Common Tasks

### Adding a new component

1. Create `src/components/ComponentName.tsx`
2. Define props interface
3. Export from `src/components/index.ts`
4. Import using `@/components`

### Adding a new type

1. Add to `src/types/index.ts`
2. Export from the same file
3. Import using `import type { TypeName } from '@/types'`

### Running quality checks

```bash
npm run typecheck  # TypeScript errors
npm run lint       # ESLint issues
npm run test       # Run tests
```

## Using Skills

This codebase includes AI agent skills for streamlined workflows.

### Creating a PRD (Product Requirements Document)

Instead of manually writing `prd.json`, use the PRD skill:

```
Load the prd skill and create a PRD for [your feature description]
```

The skill will:
1. Ask 3-5 clarifying questions (respond like "1A, 2C, 3B")
2. Generate a structured PRD
3. Save to `tasks/prd-[feature-name].md`

### Converting PRD to Ralph format

After creating a PRD, convert it to the JSON format Ralph uses:

```
Load the ralph skill and convert tasks/prd-[feature-name].md to prd.json
```

This creates `spec/prd.json` with properly sized user stories.

### Full workflow

1. Create PRD: `Load prd skill, create PRD for task filtering`
2. Convert to JSON: `Load ralph skill, convert tasks/prd-task-filtering.md`
3. Run Ralph: `./scripts/ralph/ralph.sh`

## Known Gotchas

1. **Tailwind dynamic classes:** Must be in `safelist` in `tailwind.config.js`
2. **Path aliases:** `@/` only works in `src/`, not in config files
3. **Vitest globals:** `describe`, `it`, `expect` are global (no import needed)
4. **PRD story size:** Each user story must be completable in one Ralph iteration

_This file is automatically read by AI coding agents. Update it when you discover new patterns or gotchas._
