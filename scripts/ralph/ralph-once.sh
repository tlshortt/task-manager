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

ARCHIVE_DIR="$SCRIPT_DIR/archive"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
LOG_FILE="$SCRIPT_DIR/ralph.log"

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

# Check for branch mismatch and auto-archive if needed
check_and_archive() {
  if [ ! -f "$PRD_FILE" ]; then
    return 0
  fi
  
  local prd_branch=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null)
  if [ -z "$prd_branch" ]; then
    echo -e "${YELLOW}⚠️ prd.json has no branchName field${NC}"
    return 0
  fi
  
  local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  if [ -z "$current_branch" ]; then
    return 0
  fi
  
  if [ "$prd_branch" = "$current_branch" ]; then
    return 0
  fi
  
  echo -e "${BLUE}Branch mismatch: prd.json='$prd_branch' vs git='$current_branch'${NC}"
  
  local date_prefix=$(date '+%Y-%m-%d')
  local sanitized_branch=$(echo "$prd_branch" | sed 's|/|-|g' | sed 's|[^a-zA-Z0-9_-]||g')
  local archive_folder="$ARCHIVE_DIR/${date_prefix}-${sanitized_branch}"
  
  mkdir -p "$archive_folder"
  
  [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$archive_folder/prd.json" && echo -e "${GREEN}✅ Archived prd.json${NC}"
  [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$archive_folder/progress.txt" && echo -e "${GREEN}✅ Archived progress.txt${NC}"
  [ -f "$LOG_FILE" ] && cp "$LOG_FILE" "$archive_folder/ralph.log" && echo -e "${GREEN}✅ Archived ralph.log${NC}"
  
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "# New feature branch: $current_branch" >> "$PROGRESS_FILE"
  echo "" >> "$PROGRESS_FILE"
  
  echo ""
  echo -e "${YELLOW}⚠️  PRD was for '$prd_branch' but you're on '$current_branch'${NC}"
  echo -e "${YELLOW}Old files archived to: $archive_folder${NC}"
  echo -e "${YELLOW}Please update prd.json for the new feature.${NC}"
  echo ""
  exit 0
}

check_and_archive

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
