# Task Manager

Vite + React + TypeScript task manager app, set up to work with `ralphy` (autonomous AI coding loop).

## Prerequisites

- Node.js 18+ and npm
- Git
- `ralphy` installed and on PATH

## Quick Start

### 1. Clone and Install

```bash
git clone <this-repo>
cd ralph-starter-kit
npm install
```

### 2. Initialize Git (if not already)

```bash
git init
git add -A
git commit -m "Initial commit"
```

### Run ralphy

```bash
ralphy --prd spec/prd.json
```

## Project Structure

```
ralph-starter-kit/
├── src/                    # Application source code
│   ├── components/         # React components
│   │   └── index.ts        # Component barrel exports
│   ├── types/              # TypeScript types
│   ├── test/               # Test setup
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles + Tailwind
├── spec/                   # Ralph specification files
│   ├── prd.json            # Task definitions
│   ├── progress.txt        # Progress tracking
│   └── PROMPT.md           # Instructions for AI agent
├── skills/                 # AI agent skills (reusable prompts)
│   ├── agent-browser/      # Browser automation skill
│   │   └── SKILL.md
│   ├── prd/                # PRD Generator skill
│   │   └── SKILL.md
│   └── ralph/              # Ralph PRD Converter skill
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

```bash
ralphy --dry-run --prd spec/prd.json
```

### View Progress Log

```bash
cat spec/progress.txt
```

### View Execution Log

```bash
# ralphy prints output to stdout; redirect if you want a log:
# ralphy --prd spec/prd.json | tee ralphy.log
```

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

### "Claude Code CLI not found"

Install with: `curl -fsSL https://claude.ai/install.sh | bash`

### "jq not found"

Install jq for your OS (see Prerequisites)

### ralphy completes immediately

Check if your PRD has any remaining tasks (e.g. tasks already marked complete).

### ralphy gets stuck on a task

- Re-run with `--verbose`
- Task might be too big - split into smaller items
- Add more specific acceptance criteria

## Resources

- [Ralph Loop Concept](https://ghuntley.com/ralph/) - Geoffrey Huntley's original article
- [Matt Pocock's Tips](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum) - 11 tips for effective Ralph usage
- [snarktank/ralph](https://github.com/snarktank/ralph) - Ryan Carson's implementation
- [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code) - Official documentation

## License

MIT - Use freely, modify as needed.

