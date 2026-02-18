#!/usr/bin/env bash
set -euo pipefail

SNAPSHOTS_DIR="$(cd "$(dirname "$0")/.." && pwd)/snapshots"
AB="agent-browser"

# ── Detect dev server ──────────────────────────────────────────────
BASE_URL=""
for port in 5173 5174; do
  if curl -s -o /dev/null -w '' "http://localhost:$port" 2>/dev/null; then
    BASE_URL="http://localhost:$port"
    break
  fi
done

if [ -z "$BASE_URL" ]; then
  echo "Error: No dev server detected on port 5173 or 5174."
  echo "Start the dev server first:  npm run dev"
  exit 1
fi

echo "Using dev server at $BASE_URL"
echo "Snapshots will be saved to $SNAPSHOTS_DIR"
echo ""

mkdir -p "$SNAPSHOTS_DIR"
CAPTURED=0

capture() {
  local name="$1"
  local path="$SNAPSHOTS_DIR/$name"
  $AB screenshot body "$path"
  if [ -f "$path" ]; then
    CAPTURED=$((CAPTURED + 1))
    echo "  ✓ $name"
  else
    echo "  ✗ $name (failed)"
  fi
}

# ── 01: Default view (light mode, initial load) ───────────────────
echo "Opening app..."
$AB open "$BASE_URL"
$AB wait 2000
capture "01-default-view.png"

# ── 02: Dark mode ─────────────────────────────────────────────────
echo "Toggling dark mode..."
$AB click 'button[aria-label="Switch to dark mode"]'
$AB wait 1000
capture "02-dark-mode.png"

# Switch back to light mode for remaining screenshots
$AB click 'button[aria-label="Switch to light mode"]'
$AB wait 500

# ── 03: Task input focused ────────────────────────────────────────
echo "Focusing task input..."
$AB click 'input[aria-label="New task title"]'
$AB wait 500
capture "03-task-input-focus.png"

# Click elsewhere to unfocus
$AB click 'body'
$AB wait 300

# ── 04: Filter — Completed tab ────────────────────────────────────
echo "Selecting Completed tab..."
$AB click '[role="tab"][aria-label*="Completed"]'
$AB wait 1000
capture "04-filter-completed.png"

# ── 05: Filter — Overdue tab ──────────────────────────────────────
echo "Selecting Overdue tab..."
$AB click '[role="tab"][aria-label*="Overdue"]'
$AB wait 1000
capture "05-filter-overdue.png"

# Reset to Current tab
$AB click '[role="tab"][aria-label*="Current"]'
$AB wait 500

# ── 06: Calendar view ─────────────────────────────────────────────
echo "Switching to calendar view..."
$AB click 'button[aria-label="Calendar view"]'
$AB wait 1000
capture "06-calendar-view.png"

# Switch back to list view
$AB click 'button[aria-label="List view"]'
$AB wait 500

# ── 07: Empty state (search for gibberish) ────────────────────────
echo "Triggering empty state via search..."
$AB click 'input[aria-label="Search tasks"]'
$AB fill 'input[aria-label="Search tasks"]' 'zzzxxyynonsense999'
$AB wait 1000
capture "07-empty-state.png"

# Clear search
$AB fill 'input[aria-label="Search tasks"]' ''
$AB wait 300

# ── Cleanup ───────────────────────────────────────────────────────
echo "Closing browser..."
$AB close

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Visual snapshot capture complete"
echo "  Captured: $CAPTURED / 7 screenshots"
echo "  Location: $SNAPSHOTS_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh "$SNAPSHOTS_DIR"/*.png 2>/dev/null || echo "  (no screenshots found)"
