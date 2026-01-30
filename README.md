# Task Manager

Vite + React + TypeScript task manager app, built to experiment with agentic loop workflows. Convex persistence.

## Prerequisites

- Node.js 18+ and npm
- Git

## Quick Start

### 1. Clone and Install

```bash
git clone <this-repo>
cd task-manager
npm install
```

### 2. Convex Setup

```bash
npx convex dev
```

Follow prompts to link or create a Convex project.

### 3. Initialize Git (if not already)

```bash
git init
git add -A
git commit -m "Initial commit"
```

### Run your agentic loop workflow

Use your preferred agentic loop runner with `spec/prd.json` as input.

## Project Structure

```
task-manager/
├── convex/                 # Convex functions/schema
├── CONVEX_SETUP.md         # Convex setup notes
├── convex.json             # Convex config
├── src/                    # Application source code
│   ├── components/         # React components
│   ├── constants/          # App constants
│   ├── db/                 # Legacy Dexie (unused)
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript types
│   ├── utils/              # Utilities
│   ├── test/               # Test setup
│   ├── App.test.tsx        # App tests
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   ├── index.css           # Global styles + Tailwind
│   └── vite-env.d.ts       # Vite env types
├── spec/                   # Agentic loop workflow specs
│   ├── prd.json            # Task definitions
│   ├── progress.txt        # Progress tracking
│   └── PROMPT.md           # Instructions for AI agent
├── skills/                 # AI agent skills (reusable prompts)
│   ├── agent-browser/      # Browser automation skill
│   │   └── SKILL.md
│   ├── prd/                # PRD Generator skill
│   │   └── SKILL.md
│   └── ralph/              # Agentic loop PRD converter skill
│       └── SKILL.md
├── tasks/                  # Generated PRD documents
│   └── prd-*.md            # PRDs created by the prd skill
├── AGENTS.md               # Codebase conventions for AI
└── README.md               # This file
```

## NPM Scripts

| Script               | Description               |
| -------------------- | ------------------------- |
| `npm run dev`        | Start Vite dev server     |
| `npm run build`      | Build for production      |
| `npm run typecheck`  | Run TypeScript checks     |
| `npm run lint`       | Run ESLint                |
| `npm run test`       | Run Vitest tests          |
| `npm run test:watch` | Run Vitest in watch mode  |

## Creating Your First PRD

Start by defining what you want to build. You can either:

1. **Use the PRD skill** to create a PRD interactively:
   ```
   Load the prd skill and create a PRD for [your feature description]
   ```

2. **Manually create** a PRD by editing `spec/prd.json`

## Customizing the PRD

Edit `spec/prd.json` to define your own tasks:

```json
{
  "projectName": "Your Feature Name",
  "branchName": "feature/your-feature",
  "description": "What you're building",
  "userStories": [
    {
      "id": "US-001",
      "title": "First task",
      "description": "As a user, I want...",
      "acceptanceCriteria": [
        "Criterion 1",
        "Criterion 2",
        "npm run typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

### Tips for Good PRD Items

- **Small scope:** Each item should fit in one context window
- **Clear criteria:** Include specific acceptance criteria
- **Verifiable:** Include "npm run typecheck passes" or similar
- **Ordered:** Use priority numbers (1 = first)

## Monitoring Progress

### Check Status

Check your runner's dry-run or status output.

### View Progress Log

```bash
cat spec/progress.txt
```

### View Execution Log

Redirect your runner's stdout to a log if needed.

### Check Git History

```bash
git log --oneline -20
```

## Safety Tips

1. Start with `--dry-run`
2. Use `--max-iterations` to cap runs
3. Use feature branches (`branchName`)
4. Review commits before merging

## Troubleshooting

### Runner completes immediately

Check if your PRD has any remaining tasks (e.g. tasks already marked complete).

### Runner gets stuck on a task

- Re-run with `--verbose`
- Task might be too big - split into smaller items
- Add more specific acceptance criteria

## License

MIT - Use freely, modify as needed.
