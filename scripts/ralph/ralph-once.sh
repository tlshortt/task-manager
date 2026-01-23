#!/bin/bash

# ============================================================================
# Ralph Once - Single Iteration for Human-in-the-Loop Mode
# ============================================================================
# Usage: ./scripts/ralph/ralph-once.sh [--tool claude|amp|cursor]
#
# Options:
#   --tool <tool>  AI tool to use: claude (default), amp, or cursor
#
# Runs a single Ralph iteration so you can watch and intervene.
# Great for learning how Ralph works or for risky changes.
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROMPT_FILE="$SCRIPT_DIR/PROMPT.md"

# Default AI tool
AI_TOOL="claude"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tool)
      AI_TOOL="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Validate AI_TOOL
case "$AI_TOOL" in
  claude|amp|cursor)
    ;;
  *)
    echo "Error: Invalid tool '$AI_TOOL'. Must be one of: claude, amp, cursor"
    exit 1
    ;;
esac

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔍 Ralph Once - Human-in-the-Loop Mode                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check git repository is clean
check_git_clean() {
  echo -e "${BLUE}Checking git repository status...${NC}"
  
  # Check if we're in a git repository
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Not in a git repository. Ralph requires a git repository to track changes.${NC}"
    exit 1
  fi
  
  # Check for uncommitted changes
  local has_changes=false
  local changes_details=""
  
  # Check for modified or staged files
  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    has_changes=true
    changes_details="${changes_details}Modified/staged files:\n"
    changes_details="${changes_details}$(git diff-index --name-status HEAD -- 2>/dev/null | head -10)\n"
  fi
  
  # Check for untracked files (excluding .gitignore patterns)
  local untracked=$(git ls-files --others --exclude-standard 2>/dev/null)
  if [ -n "$untracked" ]; then
    has_changes=true
    changes_details="${changes_details}Untracked files:\n"
    changes_details="${changes_details}$(echo "$untracked" | head -10)\n"
    local untracked_count=$(echo "$untracked" | wc -l | tr -d ' ')
    if [ "$untracked_count" -gt 10 ]; then
      changes_details="${changes_details}... and $((untracked_count - 10)) more untracked files\n"
    fi
  fi
  
  if [ "$has_changes" = true ]; then
    echo ""
    echo -e "${RED}ERROR: Git repository has uncommitted changes!${NC}"
    echo ""
    echo -e "${RED}Uncommitted changes detected:${NC}"
    echo -e "$changes_details"
    echo ""
    echo -e "${RED}Please commit or stash your changes before running Ralph.${NC}"
    echo -e "${RED}This prevents confusing conflicts and ensures a clean working state.${NC}"
    echo ""
    echo -e "${YELLOW}To commit: git add . && git commit -m 'your message'${NC}"
    echo -e "${YELLOW}To stash: git stash${NC}"
    echo ""
    exit 1
  fi
  
  echo -e "${GREEN}✅ Git repository is clean${NC}"
  echo ""
}

check_git_clean

# Validate PRD schema
echo -e "${BLUE}Validating PRD schema...${NC}"
if ! "$SCRIPT_DIR/validate-prd.sh" "$PRD_FILE" > /dev/null 2>&1; then
  echo -e "${RED}ERROR: PRD schema validation failed${NC}"
  "$SCRIPT_DIR/validate-prd.sh" "$PRD_FILE"
  exit 1
fi
echo -e "${GREEN}✅ PRD schema is valid${NC}"
echo ""

# Show current status
echo -e "${BLUE}Current PRD Status:${NC}"
jq -r '.userStories[] | "  [\(if .passes then "✅" else "⬜" end)] \(.id): \(.title)"' "$PRD_FILE"
echo ""

# Show what task will be picked
echo -e "${BLUE}Next task to work on:${NC}"
jq -r '.userStories | map(select(.passes == false)) | .[0] | "  \(.id): \(.title)\n  Acceptance Criteria:\n\(.acceptanceCriteria | map("    - " + .) | join("\n"))"' "$PRD_FILE"
echo ""

read -p "Press Enter to run $AI_TOOL, or Ctrl+C to cancel..."
echo ""

cd "$PROJECT_ROOT"

# Function to run AI tool interactively
run_ai_tool_interactive() {
  local prompt="$1"
  
  case "$AI_TOOL" in
    claude)
      # No --dangerously-skip-permissions for interactive mode
      claude -p "$prompt" --output-format text
      ;;
    amp)
      # No --yes for interactive mode
      amp run --prompt "$prompt"
      ;;
    cursor)
      agent --prompt "$prompt"
      ;;
  esac
}

echo -e "${BLUE}Using AI tool: $AI_TOOL${NC}"
echo ""

# Run AI tool interactively
run_ai_tool_interactive "$(cat "$PROMPT_FILE")"

echo ""
echo -e "${GREEN}✅ Single iteration complete${NC}"
echo ""
echo "Updated PRD Status:"
jq -r '.userStories[] | "  [\(if .passes then "✅" else "⬜" end)] \(.id): \(.title)"' "$PRD_FILE"
