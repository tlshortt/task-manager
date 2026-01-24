# Task Manager

A complete starter template for using the **Ralph Loop** - an autonomous AI coding technique that runs AI agents in a loop until all tasks are complete.

This project includes a clean Vite + React + TypeScript application ready for you to build features with Ralph.

## What is the Ralph Loop?

The Ralph Loop (named after Ralph Wiggum from The Simpsons) is a technique where:

1. You define tasks in a **PRD (Product Requirements Document)**
2. A bash script runs an AI coding agent (like Claude Code) in a loop
3. Each iteration, the agent picks ONE task, implements it, commits, and exits
4. The loop continues until all tasks are complete

**Key insight:** Each iteration starts with fresh context. Memory persists through git history and progress files, not the LLM's context window.

## Prerequisites

- **Node.js 18+** and npm
- **Claude Code CLI** (or another AI coding CLI)
- **jq** for JSON parsing
- **Git** initialized in the project

### Installing Claude Code

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### Installing jq

```bash
# macOS
brew install jq
```

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

### 3. Make Scripts Executable

```bash
chmod +x scripts/ralph/*.sh
```

### 4. Check Status

```bash
npm run ralph:status
# or
./scripts/ralph/ralph-status.sh
```

### 5. Run Ralph (Human-in-the-Loop Mode First!)

Start with single iterations to learn how it works:

```bash
npm run ralph:once
# or
./scripts/ralph/ralph-once.sh
```

### 6. Run Ralph (Autonomous Mode)

Once comfortable, run the full loop:

```bash
npm run ralph 10  # Run up to 10 iterations
# or
./scripts/ralph/ralph.sh 10
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
├── scripts/ralph/          # Ralph loop scripts
│   ├── ralph.sh            # Main autonomous loop
│   ├── ralph-once.sh       # Single iteration (HITL)
│   ├── ralph-status.sh     # Check PRD status
│   └── validate-prd.sh     # Validate PRD schema
├── spec/                   # Ralph specification files
│   ├── prd.json            # Task definitions
│   ├── prd.json.example    # Example PRD template
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

| Script                   | Description                            |
| ------------------------ | -------------------------------------- |
| `npm run dev`            | Start Vite dev server                  |
| `npm run build`          | Build for production                   |
| `npm run typecheck`      | Run TypeScript checks                  |
| `npm run lint`           | Run ESLint                             |
| `npm run test`           | Run Vitest tests                       |
| `npm run ralph`          | Run Ralph loop (default 10 iterations) |
| `npm run ralph:once`     | Run single Ralph iteration (HITL)      |
| `npm run ralph:status`   | Check PRD completion status            |
| `npm run ralph:validate` | Validate PRD schema                    |

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

### Validating Your PRD

Before running Ralph, validate your PRD schema:

```bash
./scripts/ralph/validate-prd.sh
```

This checks for:

- ✅ Required fields (projectName, branchName, description, userStories)
- ✅ Correct types (e.g., `passes` must be boolean, not string)
- ✅ Non-empty userStories array
- ✅ Unique user story IDs
- ✅ Sequential priorities starting at 1
- ✅ Non-empty acceptance criteria

The validation runs automatically when you start Ralph, but you can run it manually to catch errors early.

## Monitoring Progress

### Check Status

```bash
npm run ralph:status
```

### View Progress Log

```bash
cat spec/progress.txt
```

### View Execution Log

```bash
cat scripts/ralph/ralph.log
```

### Check Git History

```bash
git log --oneline -20
```

## Safety Tips

1. **Start with HITL:** Use `ralph-once.sh` first to understand behavior
2. **Cap iterations:** Always set a max (e.g., `ralph.sh 20`)
3. **Use branches:** PRD has a `branchName` - work on feature branches
4. **Review commits:** Check git history before merging
5. **Sandboxing:** For overnight runs, consider Docker containers

## Troubleshooting

### "Claude Code CLI not found"

Install with: `curl -fsSL https://claude.ai/install.sh | bash`

### "jq not found"

Install jq for your OS (see Prerequisites)

### "Permission denied"

Run: `chmod +x scripts/ralph/*.sh`

### Ralph completes immediately

Check if all PRD items already have `passes: true`

### Ralph gets stuck on a task

- Check `ralph.log` for errors
- Task might be too big - split into smaller items
- Add more specific acceptance criteria

## Improvements & Future Features

See [IMPROVEMENTS.md](scripts/ralph/IMPROVEMENTS.md) for:

- ✅ Implemented improvements (PRD validation)
- 🔄 Suggested improvements (pre-flight checks, rollback, cost tracking, etc.)
- Implementation priorities and complexity estimates

## Resources

- [Ralph Loop Concept](https://ghuntley.com/ralph/) - Geoffrey Huntley's original article
- [Matt Pocock's Tips](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum) - 11 tips for effective Ralph usage
- [snarktank/ralph](https://github.com/snarktank/ralph) - Ryan Carson's implementation
- [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code) - Official documentation

## License

MIT - Use freely, modify as needed.

---

Built with the Ralph Loop technique 🤖
