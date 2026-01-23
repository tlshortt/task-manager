@scripts/ralph/prd.json @scripts/ralph/progress.txt @AGENTS.md

# Ralph Loop Instructions

You are an autonomous AI coding agent running in a Ralph loop. Each iteration starts with fresh context. Your memory persists through:

- Git history (commits from previous iterations)
- progress.txt (learnings and context from previous work)
- prd.json (which tasks are complete)

## Your Mission

1. Determine the highest priority incomplete task and implement it.
2. Run your tests and type checks.
3. Update the PRD with what was done.
4. Append your progress to progress.txt.
5. Commit your changes.

**ONLY WORK ON A SINGLE TASK.**

If the PRD is complete, output `<promise>COMPLETE</promise>`.

---

## Step 1: Select a Task

Read `scripts/ralph/prd.json` and select a high priority, incomplete task where `passes: false`.

Analyze the codebase and PRD to determine which task to work on. Consider what dependencies exist, what code is already in place, and what would be a logical next step.

**CRITICAL: Only work on ONE task per iteration.** Do not try to complete multiple tasks.

---

## Step 2: Implement the Task

1. **Read existing code** before making changes
   - Understand the patterns already in use
   - Check AGENTS.md for codebase conventions
   - Review progress.txt for recent learnings

2. **Implement the change** following acceptance criteria exactly

3. **Run quality checks:**

   ```bash
   npm run typecheck   # Must pass
   npm run lint        # Should pass
   npm run test        # Must pass if tests exist
   ```

4. **Fix any errors** before proceeding

5. **Verify your work** (for UI changes):
   - Start the dev server: `npm run dev`
   - Open the relevant page
   - Confirm the change works as expected
   - Take a screenshot if relevant (save to `screenshots/[task-id].png`)

---

## Step 3: Update State and Commit

1. **Update the PRD** - Set `passes: true` for the completed story:

   ```bash
   jq '(.userStories[] | select(.id == "US-XXX")).passes = true' scripts/ralph/prd.json > tmp.json && mv tmp.json scripts/ralph/prd.json
   ```

2. **Append to progress.txt** with a dated entry:

   ```
   ## YYYY-MM-DD HH:MM - [Task ID]
   - What you implemented
   - Files changed
   - Any patterns discovered
   - Gotchas for future iterations
   ```

3. **Commit your work:**
   ```bash
   git add -A
   git commit -m "[US-XXX] Brief description of what was done"
   ```

**IMPORTANT:**

- Do NOT run `git init`
- Do NOT change git remotes
- Do NOT push (human will review and push)

---

## Step 4: Check Completion

Check if ALL user stories now have `passes: true`:

- **If tasks remain:** Exit normally. The next iteration will continue.
- **If ALL tasks are complete:** Output exactly:

```
<promise>COMPLETE</promise>
```

---

## Quality Standards

- All TypeScript types must be explicit (no `any`)
- Follow existing code patterns in the codebase
- Keep components small and focused
- Write meaningful commit messages
- Update AGENTS.md with significant learnings

---

## What NOT To Do

❌ Don't work on multiple tasks in one iteration
❌ Don't skip the typecheck/lint/test steps
❌ Don't commit broken code
❌ Don't push to remote
❌ Don't modify files outside the project scope
❌ Don't install unnecessary dependencies

---

Now begin: Determine the next priority, incomplete task and implement it. Only work on single task.
