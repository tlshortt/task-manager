# Define filter UX

- Define filter UX: dropdowns for recurrence, category, priority + default “All”.
  - Placement: under search, above status tabs, left-aligned; stack on mobile.
  - Control type: native `select` for now (a11y, speed), with consistent height + focus ring.
  - Recurrence options: All (default), Recurring, Non-recurring, Daily, Weekly, Monthly, Yearly.
  - Category options: All (default), Uncategorized (no tags), then tag list sorted A→Z.
  - Priority options: All (default), Low, Medium, High.
  - Empty states: if no tags, show only All + Uncategorized.
  - Labels: “Recurrence”, “Category”, “Priority”; keep aria-labels.
