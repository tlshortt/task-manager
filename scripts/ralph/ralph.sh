#!/bin/bash

# ============================================================================
# Ralph Loop - Autonomous AI Coding Agent Loop
# ============================================================================
# Usage: ./scripts/ralph/ralph.sh [max_iterations] [--tool claude|amp|cursor]
# 
# Options:
#   --tool <tool>  AI tool to use: claude (default), amp, or cursor
#
# Environment Variables:
#   ITERATION_TIMEOUT - Timeout in seconds for each iteration (default: 600)
#   MAX_CONSECUTIVE_FAILURES - Max consecutive failures before exit (default: 3)
#
# This script runs an AI coding agent in a loop until:
# 1. All tasks in prd.json are complete (passes: true)
# 2. The agent outputs <promise>COMPLETE</promise>
# 3. Max iterations is reached
# 4. Max consecutive failures is reached (prevents stuck tasks from burning iterations)
# 5. An iteration times out (configurable via ITERATION_TIMEOUT)
#
# Prerequisites:
# - AI CLI installed (one of):
#   - Claude Code: curl -fsSL https://claude.ai/install.sh | bash
#   - Amp CLI: npm install -g @anthropic-ai/amp
#   - Cursor CLI: Install from cursor.sh
# - jq installed: brew install jq (macOS) or apt install jq (Linux)
# - timeout command: built-in on Linux, or install coreutils on macOS (brew install coreutils)
# - A git repository initialized in this project
# ============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
PROMPT_FILE="$SCRIPT_DIR/PROMPT.md"
LOG_FILE="$SCRIPT_DIR/ralph.log"
LOCK_FILE="$SCRIPT_DIR/.ralph.lock"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
TIMEOUT_SECONDS=${ITERATION_TIMEOUT:-600}  # Default 10 minutes
CONSECUTIVE_FAILURES=0
MAX_CONSECUTIVE_FAILURES=${MAX_CONSECUTIVE_FAILURES:-3}

# Default values
MAX_ITERATIONS=10
AI_TOOL="claude"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tool)
      AI_TOOL="$2"
      shift 2
      ;;
    *)
      # Assume it's max_iterations if it's a number
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        MAX_ITERATIONS="$1"
      fi
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

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${BLUE}[$timestamp]${NC} $1"
  echo "[$timestamp] $1" >> "$LOG_FILE"
}

error() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${RED}[$timestamp] ERROR:${NC} $1"
  echo "[$timestamp] ERROR: $1" >> "$LOG_FILE"
}

success() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${GREEN}[$timestamp] ✅${NC} $1"
  echo "[$timestamp] ✅ $1" >> "$LOG_FILE"
}

warning() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${YELLOW}[$timestamp] ⚠️${NC} $1"
  echo "[$timestamp] ⚠️ $1" >> "$LOG_FILE"
}

check_git_clean() {
  log "Checking git repository status..."
  
  # Check if we're in a git repository
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Not in a git repository. Ralph requires a git repository to track changes."
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
    error "Git repository has uncommitted changes!"
    echo ""
    echo -e "${RED}Uncommitted changes detected:${NC}"
    echo -e "$changes_details"
    echo ""
    error "Please commit or stash your changes before running Ralph."
    error "This prevents confusing conflicts and ensures a clean working state."
    echo ""
    error "To commit: git add . && git commit -m 'your message'"
    error "To stash: git stash"
    exit 1
  fi
  
  success "Git repository is clean"
}

get_tool_command() {
  case "$AI_TOOL" in
    claude)
      echo "claude"
      ;;
    amp)
      echo "amp"
      ;;
    cursor)
      echo "agent"
      ;;
  esac
}

get_tool_install_instructions() {
  case "$AI_TOOL" in
    claude)
      echo "Install with: curl -fsSL https://claude.ai/install.sh | bash"
      ;;
    amp)
      echo "Install with: npm install -g @anthropic-ai/amp"
      ;;
    cursor)
      echo "Install from: https://cursor.sh"
      ;;
  esac
}

check_prerequisites() {
  log "Checking prerequisites..."
  log "Using AI tool: $AI_TOOL"
  
  local tool_cmd=$(get_tool_command)
  if ! command -v "$tool_cmd" &> /dev/null; then
    error "$AI_TOOL CLI not found. $(get_tool_install_instructions)"
    exit 1
  fi
  
  if ! command -v jq &> /dev/null; then
    error "jq not found. Install with: brew install jq (macOS) or apt install jq (Linux)"
    exit 1
  fi
  
  if [ ! -f "$PRD_FILE" ]; then
    error "PRD file not found at $PRD_FILE"
    exit 1
  fi
  
  if [ ! -f "$PROMPT_FILE" ]; then
    error "Prompt file not found at $PROMPT_FILE"
    exit 1
  fi
  
  # Validate PRD schema
  log "Validating PRD schema..."
  if ! "$SCRIPT_DIR/validate-prd.sh" "$PRD_FILE" > /dev/null 2>&1; then
    error "PRD schema validation failed. Run ./scripts/ralph/validate-prd.sh for details."
    "$SCRIPT_DIR/validate-prd.sh" "$PRD_FILE"
    exit 1
  fi
  
  success "All prerequisites met"
}

find_timeout_command() {
  # Check for timeout command (Linux) or gtimeout (macOS with coreutils)
  if command -v timeout &> /dev/null; then
    echo "timeout"
  elif command -v gtimeout &> /dev/null; then
    echo "gtimeout"
  else
    echo ""
  fi
}

run_with_timeout() {
  local timeout_cmd=$(find_timeout_command)
  local timeout_seconds=$1
  shift  # Remove first argument, rest are the command to run
  
  if [ -z "$timeout_cmd" ]; then
    warning "timeout command not found. Install 'timeout' (Linux) or 'gtimeout' via 'brew install coreutils' (macOS)"
    warning "Running without timeout protection - iteration may hang indefinitely"
    # Run without timeout as fallback
    "$@"
    return $?
  fi
  
  # Run command with timeout
  # Exit code 124 means timeout occurred
  $timeout_cmd "$timeout_seconds" "$@"
  local exit_code=$?
  
  if [ $exit_code -eq 124 ]; then
    error "Command timed out after ${timeout_seconds} seconds"
    return 124
  fi
  
  return $exit_code
}

run_ai_tool() {
  local prompt="$1"
  
  case "$AI_TOOL" in
    claude)
      claude -p "$prompt" --output-format text --dangerously-skip-permissions
      ;;
    amp)
      amp run --prompt "$prompt" --yes
      ;;
    cursor)
      agent --prompt "$prompt"
      ;;
  esac
}

get_pending_count() {
  jq '[.userStories[] | select(.passes == false)] | length' "$PRD_FILE"
}

get_completed_count() {
  jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE"
}

get_total_count() {
  jq '.userStories | length' "$PRD_FILE"
}

show_status() {
  local pending=$(get_pending_count)
  local completed=$(get_completed_count)
  local total=$(get_total_count)
  
  echo ""
  echo "========================================"
  echo "📊 PRD Status: $completed/$total complete ($pending pending)"
  echo "========================================"
  
  # Show pending tasks
  if [ "$pending" -gt 0 ]; then
    echo ""
    echo "Pending tasks:"
    jq -r '.userStories[] | select(.passes == false) | "  - [\(.id)] \(.title)"' "$PRD_FILE"
  fi
  echo ""
}

# ============================================================================
# Auto-Archive: Archives old prd.json and progress.txt when branchName changes
# ============================================================================

check_and_archive() {
  # Skip if no PRD file exists
  if [ ! -f "$PRD_FILE" ]; then
    return 0
  fi
  
  # Get branchName from prd.json
  local prd_branch=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null)
  if [ -z "$prd_branch" ]; then
    warning "prd.json has no branchName field, skipping archive check"
    return 0
  fi
  
  # Get current git branch
  local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  if [ -z "$current_branch" ]; then
    warning "Could not determine current git branch"
    return 0
  fi
  
  # Compare branches - if they match, no archive needed
  if [ "$prd_branch" = "$current_branch" ]; then
    return 0
  fi
  
  # Branches differ - archive the old files
  log "Branch mismatch detected: prd.json='$prd_branch' vs git='$current_branch'"
  
  # Create archive folder name: YYYY-MM-DD-branchName (sanitized)
  local date_prefix=$(date '+%Y-%m-%d')
  local sanitized_branch=$(echo "$prd_branch" | sed 's|/|-|g' | sed 's|[^a-zA-Z0-9_-]||g')
  local archive_folder="$ARCHIVE_DIR/${date_prefix}-${sanitized_branch}"
  
  # Create archive directory
  mkdir -p "$archive_folder"
  
  # Archive prd.json
  if [ -f "$PRD_FILE" ]; then
    cp "$PRD_FILE" "$archive_folder/prd.json"
    success "Archived prd.json → $archive_folder/prd.json"
  fi
  
  # Archive progress.txt
  if [ -f "$PROGRESS_FILE" ]; then
    cp "$PROGRESS_FILE" "$archive_folder/progress.txt"
    success "Archived progress.txt → $archive_folder/progress.txt"
  fi
  
  # Archive ralph.log if it exists
  if [ -f "$LOG_FILE" ]; then
    cp "$LOG_FILE" "$archive_folder/ralph.log"
    success "Archived ralph.log → $archive_folder/ralph.log"
  fi
  
  log "Archive complete: $archive_folder"
  
  # Reset progress.txt for new feature
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "# This file tracks progress across iterations" >> "$PROGRESS_FILE"
  echo "# Archived from: $prd_branch" >> "$PROGRESS_FILE"
  echo "# New feature branch: $current_branch" >> "$PROGRESS_FILE"
  echo "" >> "$PROGRESS_FILE"
  log "Reset progress.txt for new feature"
  
  # Warn user they need a new prd.json
  echo ""
  warning "⚠️  PRD was for branch '$prd_branch' but you're on '$current_branch'"
  warning "Old files archived to: $archive_folder"
  warning "Please update prd.json for the new feature before running Ralph."
  echo ""
  
  exit 0
}

acquire_lock() {
  # Check if lock file exists
  if [ -f "$LOCK_FILE" ]; then
    local lock_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    
    if [ -z "$lock_pid" ]; then
      warning "Lock file exists but is empty. Removing stale lock."
      rm -f "$LOCK_FILE"
    else
      # Check if the PID is still running
      if ps -p "$lock_pid" > /dev/null 2>&1; then
        error "Another Ralph instance is already running (PID: $lock_pid)"
        error "Lock file: $LOCK_FILE"
        error "If you're sure no other instance is running, remove the lock file manually."
        exit 1
      else
        warning "Found stale lock file (PID $lock_pid no longer running). Removing it."
        rm -f "$LOCK_FILE"
      fi
    fi
  fi
  
  # Create lock file with current PID
  echo $$ > "$LOCK_FILE"
  log "Lock acquired (PID: $$)"
}

release_lock() {
  if [ -f "$LOCK_FILE" ]; then
    local lock_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    
    # Only remove if it's our lock
    if [ "$lock_pid" = "$$" ]; then
      rm -f "$LOCK_FILE"
      log "Lock released"
    else
      warning "Lock file contains different PID ($lock_pid vs $$). Not removing."
    fi
  fi
}

cleanup() {
  release_lock
}

# ============================================================================
# Main Loop
# ============================================================================

main() {
  # Set up trap to ensure lock is released on exit (including Ctrl+C)
  trap cleanup EXIT INT TERM
  
  echo ""
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║               🚀 Ralph Loop - Starting Up                      ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
  
  # Acquire lock before doing anything else
  acquire_lock
  
  check_prerequisites
  
  # Check for branch mismatch and auto-archive if needed
  check_and_archive
  
  # Pre-start git clean check
  check_git_clean
  
  # Initialize progress file if it doesn't exist
  if [ ! -f "$PROGRESS_FILE" ]; then
    echo "# Ralph Progress Log" > "$PROGRESS_FILE"
    echo "# This file tracks progress across iterations" >> "$PROGRESS_FILE"
    echo "" >> "$PROGRESS_FILE"
  fi
  
  # Initialize log file
  echo "=== Ralph Loop Started: $(date) ===" >> "$LOG_FILE"
  echo "AI tool: $AI_TOOL" >> "$LOG_FILE"
  echo "Max iterations: $MAX_ITERATIONS" >> "$LOG_FILE"
  echo "Iteration timeout: ${TIMEOUT_SECONDS}s" >> "$LOG_FILE"
  echo "Max consecutive failures: $MAX_CONSECUTIVE_FAILURES" >> "$LOG_FILE"
  
  show_status
  
  cd "$PROJECT_ROOT"
  
  for ((i=1; i<=MAX_ITERATIONS; i++)); do
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  Iteration $i of $MAX_ITERATIONS"
    echo "╚════════════════════════════════════════════════════════════════╝"
    
    log "Starting iteration $i..."
    
    # Per-iteration git clean check (Claude might leave uncommitted changes if it crashes)
    check_git_clean
    
    # Check if all tasks are already complete
    local pending_before=$(get_pending_count)
    if [ "$pending_before" -eq 0 ]; then
      success "All tasks already complete!"
      break
    fi
    
    log "Running $AI_TOOL with prompt (timeout: ${TIMEOUT_SECONDS}s)..."
    log "Pending tasks before iteration: $pending_before"
    
    # Run AI tool with the prompt and timeout protection
    local result
    local timeout_exit_code=0
    result=$(run_with_timeout "$TIMEOUT_SECONDS" bash -c "$(declare -f run_ai_tool); AI_TOOL='$AI_TOOL'; run_ai_tool \"\$(cat '$PROMPT_FILE')\"" 2>&1) || timeout_exit_code=$?
    
    # Log the result
    echo "$result" >> "$LOG_FILE"
    
    # Display truncated result
    echo "$result" | head -100
    if [ $(echo "$result" | wc -l) -gt 100 ]; then
      echo "... (output truncated, see ralph.log for full output)"
    fi
    
    # Check for progress by comparing PRD state before/after iteration
    # This is more reliable than grepping the output for "passes.*true"
    local pending_after=$(get_pending_count)
    local made_progress=false
    
    if [ "$pending_after" -lt "$pending_before" ]; then
      made_progress=true
      local tasks_completed=$((pending_before - pending_after))
      success "Completed $tasks_completed task(s) this iteration (pending: $pending_before → $pending_after)"
    fi
    
    # Check for failures and track consecutive failures
    if [ $timeout_exit_code -ne 0 ] || [ "$made_progress" = false ]; then
      CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
      log "Consecutive failures: $CONSECUTIVE_FAILURES/$MAX_CONSECUTIVE_FAILURES"
      
      if [ $timeout_exit_code -eq 124 ]; then
        error "Iteration $i timed out after ${TIMEOUT_SECONDS} seconds"
        warning "$AI_TOOL command may have hung. Check ralph.log for details."
        echo "=== Iteration $i Timed Out: $(date) ===" >> "$LOG_FILE"
      else
        warning "Iteration $i did not complete any tasks (pending still $pending_after)"
      fi
      
      if [ $CONSECUTIVE_FAILURES -ge $MAX_CONSECUTIVE_FAILURES ]; then
        error "Max consecutive failures ($MAX_CONSECUTIVE_FAILURES) reached"
        echo "=== Ralph Loop Ended (max consecutive failures): $(date) ===" >> "$LOG_FILE"
        release_lock
        exit 2
      fi
      
      # Continue to next iteration
      continue
    else
      # Success - reset consecutive failures counter
      if [ $CONSECUTIVE_FAILURES -gt 0 ]; then
        success "Success after $CONSECUTIVE_FAILURES consecutive failure(s) - resetting counter"
      fi
      CONSECUTIVE_FAILURES=0
    fi
    
    # Check for completion promise
    if echo "$result" | grep -q "<promise>COMPLETE</promise>"; then
      echo ""
      success "🎉 Ralph completed all tasks!"
      show_status
      echo "=== Ralph Loop Completed Successfully: $(date) ===" >> "$LOG_FILE"
      release_lock
      exit 0
    fi
    
    # Show updated status
    show_status
    
    log "Iteration $i complete. Pausing before next iteration..."
    sleep 3
  done
  
  echo ""
  warning "Reached max iterations ($MAX_ITERATIONS) without completion"
  show_status
  echo "=== Ralph Loop Ended (max iterations): $(date) ===" >> "$LOG_FILE"
  release_lock
  exit 1
}

# ============================================================================
# Run
# ============================================================================

main "$@"
