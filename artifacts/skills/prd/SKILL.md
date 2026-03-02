---
name: prd
description: Convert plan.md implementation plans into prd.json (spec/prd-*.json). Use when asked to "use prd skill", "create prd.json", or "convert plan.md to prd.json".
---

# Plan.md → PRD JSON

## Goal

Convert a `plan.md` file into a `prd.json` file following the existing `spec/prd-*.json` shape.

## Inputs

- Path to `plan.md`
- Output path if user specifies one; otherwise default to `spec/prd-<slug>.json`

## Output JSON Shape

```json
{
  "projectName": "...",
  "branchName": "feature/...",
  "description": "...",
  "created": "YYYY-MM-DD",
  "tasks": [
    {
      "id": "US-001",
      "title": "...",
      "description": "As a ..., I want ... so that ...",
      "acceptanceCriteria": ["...", "..."],
      "passes": false,
      "completed": false
    }
  ]
}
```

## Mapping Rules

### projectName

- Use the H1 title from the plan (strip “Implementation Plan” if present).
- If missing, use filename (title case).

### branchName

- Default: `feature/<kebab-case projectName>`.
- If plan explicitly mentions a branch name, use it.

### description

- Use the first paragraph under **Overview** or the first 1–2 sentences after the H1.
- Keep it single sentence if possible.

### created

- Use today’s date in `YYYY-MM-DD`.

### tasks

Build tasks from the plan’s phases/sections:

- Prefer sections like **Phase X**, **Implementation Order**, or major headings.
- Each phase/step becomes one `US-###` task.
- `title`: concise summary of the phase or action.
- `description`: infer “As a developer/user…” if the plan doesn’t provide one.

#### acceptanceCriteria sources

Pull criteria from:

- Bullet lists under each phase/section
- “Files to Modify” table (convert row items into criteria)
- “Edge Cases & Validation” and “Verification” sections
- Any explicit commands or checks

Rules:

- Each task needs at least 3 criteria; split multi-part bullets as needed.
- For UI changes, include “Verify in browser”.
- For code changes, include “npm run typecheck passes” if not already present.
- Keep criteria as imperative statements.

### passes / completed

- Always set `passes: false`, `completed: false` on conversion.

## Workflow

1. Read the plan.md.
2. Derive fields using Mapping Rules.
3. Emit JSON with 2-space indent, stable key order (projectName, branchName, description, created, tasks).
4. Save to output path.

## Defaults and Questions

If any of these are missing/ambiguous, ask only what’s needed:

- Output path
- Branch name
- Project name

Otherwise, proceed with defaults.
