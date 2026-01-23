#!/bin/bash

# ============================================================================
# PRD Schema Validator
# ============================================================================
# Usage: ./scripts/ralph/validate-prd.sh [path-to-prd.json]
#
# Validates that the PRD JSON has all required fields and proper structure.
# Exit codes:
#   0 - Valid PRD
#   1 - Invalid PRD (validation errors)
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get PRD file path (default to scripts/ralph/prd.json)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="${1:-$SCRIPT_DIR/prd.json}"

ERRORS=()

# ============================================================================
# Validation Functions
# ============================================================================

add_error() {
  ERRORS+=("$1")
}

validate_exists() {
  if [ ! -f "$PRD_FILE" ]; then
    echo -e "${RED}❌ PRD file not found: $PRD_FILE${NC}"
    exit 1
  fi
}

validate_json() {
  if ! jq empty "$PRD_FILE" 2>/dev/null; then
    echo -e "${RED}❌ PRD file is not valid JSON${NC}"
    exit 1
  fi
}

validate_required_fields() {
  local required_fields=("projectName" "branchName" "description" "userStories")
  
  for field in "${required_fields[@]}"; do
    local field_value=$(jq -r ".$field" "$PRD_FILE" 2>/dev/null)
    if [ "$field_value" = "null" ]; then
      add_error "Missing required field: $field"
    fi
  done
}

validate_field_types() {
  # Check projectName is a string
  if ! jq -e '.projectName | type == "string"' "$PRD_FILE" >/dev/null 2>&1; then
    add_error "Field 'projectName' must be a string"
  fi
  
  # Check branchName is a string
  if ! jq -e '.branchName | type == "string"' "$PRD_FILE" >/dev/null 2>&1; then
    add_error "Field 'branchName' must be a string"
  fi
  
  # Check description is a string
  if ! jq -e '.description | type == "string"' "$PRD_FILE" >/dev/null 2>&1; then
    add_error "Field 'description' must be a string"
  fi
  
  # Check userStories is an array
  if ! jq -e '.userStories | type == "array"' "$PRD_FILE" >/dev/null 2>&1; then
    add_error "Field 'userStories' must be an array"
  fi
}

validate_user_stories() {
  # Check userStories is not empty
  local story_count=$(jq '.userStories | length' "$PRD_FILE" 2>/dev/null || echo "0")
  if [ "$story_count" -eq 0 ]; then
    add_error "userStories array is empty"
    return
  fi
  
  # Validate each user story structure
  local story_index=0
  while [ "$story_index" -lt "$story_count" ]; do
    local story_path=".userStories[$story_index]"
    
    # Check required fields for each story
    local required_story_fields=("id" "title" "description" "acceptanceCriteria" "priority" "passes")
    
    for field in "${required_story_fields[@]}"; do
      local field_value=$(jq -r "${story_path}.${field}" "$PRD_FILE" 2>/dev/null)
      if [ "$field_value" = "null" ]; then
        add_error "User story [$story_index] missing required field: $field"
      fi
    done
    
    # Validate field types for each story
    if jq -e "${story_path}.id" "$PRD_FILE" >/dev/null 2>&1; then
      if ! jq -e "${story_path}.id | type == \"string\"" "$PRD_FILE" >/dev/null 2>&1; then
        add_error "User story [$story_index] field 'id' must be a string"
      fi
    fi
    
    if jq -e "${story_path}.title" "$PRD_FILE" >/dev/null 2>&1; then
      if ! jq -e "${story_path}.title | type == \"string\"" "$PRD_FILE" >/dev/null 2>&1; then
        add_error "User story [$story_index] field 'title' must be a string"
      fi
    fi
    
    if jq -e "${story_path}.description" "$PRD_FILE" >/dev/null 2>&1; then
      if ! jq -e "${story_path}.description | type == \"string\"" "$PRD_FILE" >/dev/null 2>&1; then
        add_error "User story [$story_index] field 'description' must be a string"
      fi
    fi
    
    if jq -e "${story_path}.acceptanceCriteria" "$PRD_FILE" >/dev/null 2>&1; then
      if ! jq -e "${story_path}.acceptanceCriteria | type == \"array\"" "$PRD_FILE" >/dev/null 2>&1; then
        add_error "User story [$story_index] field 'acceptanceCriteria' must be an array"
      else
        # Check that acceptanceCriteria is not empty
        local criteria_count=$(jq "${story_path}.acceptanceCriteria | length" "$PRD_FILE")
        if [ "$criteria_count" -eq 0 ]; then
          add_error "User story [$story_index] field 'acceptanceCriteria' cannot be empty"
        fi
      fi
    fi
    
    if jq -e "${story_path}.priority" "$PRD_FILE" >/dev/null 2>&1; then
      if ! jq -e "${story_path}.priority | type == \"number\"" "$PRD_FILE" >/dev/null 2>&1; then
        add_error "User story [$story_index] field 'priority' must be a number"
      fi
    fi
    
    if jq -e "${story_path}.passes" "$PRD_FILE" >/dev/null 2>&1; then
      if ! jq -e "${story_path}.passes | type == \"boolean\"" "$PRD_FILE" >/dev/null 2>&1; then
        add_error "User story [$story_index] field 'passes' must be a boolean (true or false, not a string)"
      fi
    fi
    
    story_index=$((story_index + 1))
  done
}

validate_unique_ids() {
  # Check for duplicate user story IDs
  local duplicate_ids=$(jq -r '[.userStories[].id] | group_by(.) | map(select(length > 1) | .[0]) | .[]' "$PRD_FILE" 2>/dev/null)
  
  if [ -n "$duplicate_ids" ]; then
    while IFS= read -r dup_id; do
      add_error "Duplicate user story ID found: $dup_id"
    done <<< "$duplicate_ids"
  fi
}

validate_priority_sequence() {
  # Check that priorities are sequential and start at 1
  local priorities=$(jq -r '[.userStories[].priority] | sort | .[]' "$PRD_FILE" 2>/dev/null)
  local expected=1
  
  while IFS= read -r priority; do
    if [ "$priority" -ne "$expected" ]; then
      add_error "Priority sequence error: expected priority $expected but found $priority (priorities should be sequential starting at 1)"
      break
    fi
    expected=$((expected + 1))
  done <<< "$priorities"
}

# ============================================================================
# Main Validation
# ============================================================================

main() {
  echo ""
  echo "🔍 Validating PRD schema: $PRD_FILE"
  echo ""
  
  # Run validations
  validate_exists
  validate_json
  validate_required_fields
  validate_field_types
  validate_user_stories
  validate_unique_ids
  validate_priority_sequence
  
  # Report results
  if [ ${#ERRORS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ PRD schema is valid${NC}"
    echo ""
    
    # Show summary
    local story_count=$(jq '.userStories | length' "$PRD_FILE")
    local project_name=$(jq -r '.projectName' "$PRD_FILE")
    local branch_name=$(jq -r '.branchName' "$PRD_FILE")
    
    echo "Project: $project_name"
    echo "Branch: $branch_name"
    echo "User Stories: $story_count"
    echo ""
    
    exit 0
  else
    echo -e "${RED}❌ PRD schema validation failed with ${#ERRORS[@]} error(s):${NC}"
    echo ""
    
    for error in "${ERRORS[@]}"; do
      echo -e "  ${RED}•${NC} $error"
    done
    
    echo ""
    echo -e "${YELLOW}Fix these errors in $PRD_FILE and try again.${NC}"
    echo ""
    
    exit 1
  fi
}

# ============================================================================
# Run
# ============================================================================

main "$@"
