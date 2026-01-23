#!/bin/bash

# ============================================================================
# Ralph Status - Check current PRD completion status
# ============================================================================
# Usage: ./scripts/ralph/ralph-status.sh
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$PROJECT_ROOT/spec/prd.json"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
NC='\033[0m'

if [ ! -f "$PRD_FILE" ]; then
  echo -e "${RED}Error: PRD file not found at $PRD_FILE${NC}"
  exit 1
fi

# Get counts
total=$(jq '.userStories | length' "$PRD_FILE")
completed=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
pending=$(jq '[.userStories[] | select(.passes == false)] | length' "$PRD_FILE")
percent=$((completed * 100 / total))

# Get project info
project_name=$(jq -r '.projectName' "$PRD_FILE")
branch_name=$(jq -r '.branchName' "$PRD_FILE")

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    📊 Ralph PRD Status                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}Project:${NC} $project_name"
echo -e "${BLUE}Branch:${NC}  $branch_name"
echo ""

# Progress bar
bar_width=40
filled=$((percent * bar_width / 100))
empty=$((bar_width - filled))
bar=$(printf "%${filled}s" | tr ' ' '█')
bar+=$(printf "%${empty}s" | tr ' ' '░')

echo -e "Progress: [${GREEN}${bar}${NC}] ${percent}%"
echo -e "          ${GREEN}$completed completed${NC} / ${YELLOW}$pending pending${NC} / $total total"
echo ""

# List all stories with status
echo "User Stories:"
echo "─────────────────────────────────────────────────────────────────"

jq -r '.userStories | .[] | 
  if .passes then
    "  ✅ [\(.id)] \(.title)"
  else
    "  ⬜ [\(.id)] \(.title)"
  end' "$PRD_FILE"

echo ""

# Show next task if any pending
if [ "$pending" -gt 0 ]; then
  echo -e "${YELLOW}Next task:${NC}"
  jq -r '.userStories | map(select(.passes == false)) | .[0] | 
    "  [\(.id)] \(.title)\n  \(.description)"' "$PRD_FILE"
  echo ""
fi

# Show recent progress entries
if [ -f "$PROJECT_ROOT/spec/progress.txt" ]; then
  recent=$(grep -A 3 "^## 20" "$PROJECT_ROOT/spec/progress.txt" | tail -8)
  if [ -n "$recent" ]; then
    echo -e "${GRAY}Recent progress:${NC}"
    echo "$recent" | head -8 | sed 's/^/  /'
    echo ""
  fi
fi
