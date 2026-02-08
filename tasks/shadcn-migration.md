# shadcn/ui Migration Plan

## Context

The task manager app is built with Vite + React 18 + TypeScript + Tailwind 3.4. All 33 UI components are custom-built with native HTML elements and inline Tailwind classes. There is no existing component library. The goal is to migrate to shadcn/ui to gain consistent, accessible, well-maintained primitives while preserving the current purple/navy/gray visual identity and dark mode support.

Two third-party UI libraries will also be replaced: `react-datepicker` → shadcn Calendar+Popover, and `react-hot-toast` → shadcn Sonner.

**Git strategy**: Each step below = one atomic commit. This gives clean bisect/revert points if anything breaks.

**Components intentionally left as-is**: `EmptyState.tsx`, `CalendarGrid.tsx`, `CalendarTaskItem.tsx`, `CalendarView.tsx`, `CalendarDay.tsx` (complex interactive cell, not a standard button). These are either pure layout or have domain-specific rendering that doesn't benefit from shadcn primitives.

---

## Phase 1: Foundation Setup

### 1.1 Install utility dependencies
```bash
npm install tailwind-merge clsx class-variance-authority tailwindcss-animate @radix-ui/react-slot
```

### 1.2 Create `src/lib/utils.ts`
The `cn()` helper used by every shadcn component:
```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 1.3 Create `components.json` (project root)
shadcn CLI config — key settings:
- `style: "new-york"` (compact aesthetic matching current design)
- `rsc: false` (Vite SPA, not Next.js)
- `baseColor: "slate"` (matches current slate-900/gray-800 palette)
- `cssVariables: true`
- Aliases: `@/components/ui`, `@/lib/utils`, `@/hooks`

### 1.4 Update `tailwind.config.js`
- Keep existing custom colors (`navy-800`, `navy-900`, `purple-accent`, `blue-accent`)
- Add shadcn CSS variable color references (`background`, `foreground`, `primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card`, `border`, `input`, `ring`) using `hsl(var(--name))` pattern inside `extend.colors`
- Add CSS variable border-radius (`--radius`)
- Add `tailwindcss-animate` plugin
- Keep existing safelist (dynamic priority + tag colors still needed)

### 1.5 Rewrite `src/index.css`
Replace current contents with:
- Tailwind directives
- `@layer base` with CSS variables mapping current palette:
  - `--primary`: purple-600 (light) / purple-500 (dark)
  - `--background`: gray-50 (light) / slate-900 (dark)
  - `--card`: white (light) / gray-800 (dark)
  - `--destructive`: red-500 (light) / red-900 (dark)
  - `--ring`: purple-600/500 (focus rings)
  - `--radius`: 0.75rem (rounded-xl)
- Global border + body styles
- **Remove**: react-datepicker CSS overrides (lines 10-104), unused `.btn`/`.card`/`.input` classes (lines 106-127 — these are never referenced by any component)

### 1.6 Add `ResizeObserver` mock to `src/test/setup.ts`
Radix components require `ResizeObserver`, which jsdom doesn't provide. Add this now so tests don't break as components are migrated in later steps.

### 1.7 Verification
- `npm run build` compiles (no components reference CSS vars yet)
- `npm run test` — all 19 test files pass (no component code changed)

---

## Phase 2: Add shadcn Base Components

Run the CLI to scaffold each component into `src/components/ui/`:

```bash
npx shadcn@latest add button input textarea select checkbox dialog badge tabs card collapsible calendar popover sonner label toggle separator
```

This auto-installs Radix primitives (`@radix-ui/react-checkbox`, `react-dialog`, `react-select`, `react-tabs`, `react-popover`, `react-collapsible`, `react-label`, `react-separator`, `react-toggle`) plus `react-day-picker` and `sonner`.

Also create a custom composite `src/components/ui/date-picker.tsx` — a Popover + Calendar + Button wrapper with props: `date`, `onDateChange`, `placeholder`, `minDate`, `className`.

### 2.1 Verification
- `npm run build` compiles (new ui/ files exist but aren't imported yet)

---

## Phase 3: Migrate Badges

Leaf components with no downstream dependencies. Safe to migrate first.

### 3.1 TagBadge
**File**: `src/components/TagBadge.tsx`
- Wrap with shadcn `Badge variant="secondary"`, keep custom 8-color `colorMap` (domain-specific)

### 3.2 PriorityBadge
**File**: `src/components/PriorityBadge.tsx`
- Keep as tiny dot — just adopt `cn()` for class merging
- **Test**: Update `PriorityBadge.test.tsx` if DOM structure changes

### 3.3 RecurrenceBadge
**File**: `src/components/RecurrenceBadge.tsx`
- Wrap with shadcn `Badge variant="secondary"` + indigo custom classes

### 3.4 Verification
- `npm run build` + `npm run test`
- Visual check: badges look consistent in light/dark mode

---

## Phase 4: Migrate EditableText

### 4.1 EditableText
**File**: `src/components/EditableText.tsx`
- Replace native `<input>` with shadcn `Input`, `<textarea>` with `Textarea`
- Keep click-to-edit logic unchanged
- Merge parent `inputClassName` via `cn()`

### 4.2 Verification
- `npm run build` + `npm run test`

---

## Phase 5: Migrate Buttons (per-file)

Button variant mapping (reference for all steps below):
| Pattern | shadcn | Used in |
|---|---|---|
| Icon-only ghost | `variant="ghost" size="icon"` | AppHeader, TaskRow, CalendarHeader, modals |
| Primary action | `variant="default"` | SubtaskList add, TaskInput submit |
| Destructive icon | `variant="ghost" size="icon"` + red custom class | TaskRow delete, SubtaskList delete |
| Text link with icon | `variant="ghost" size="sm"` | TaskInput toolbar toggles |

Keep `CalendarDay.tsx` day cell as native `<button>` (complex interactive cell, not a standard button).

### 5.1 AppHeader
**File**: `src/components/AppHeader.tsx`
- Migrate icon buttons (theme toggle, shortcuts) → `Button variant="ghost" size="icon"`

### 5.2 CalendarHeader
**File**: `src/components/calendar/CalendarHeader.tsx`
- Migrate nav buttons (prev/next month, Today) → `Button variant="ghost" size="icon"` / `Button variant="outline" size="sm"`

### 5.3 SubtaskList
**File**: `src/components/SubtaskList.tsx`
- Add button → `Button variant="default" size="sm"`
- Delete buttons → `Button variant="ghost" size="icon"` + red class

### 5.4 RecurrencePicker (buttons only)
**File**: `src/components/RecurrencePicker.tsx`
- Migrate any standalone buttons → appropriate shadcn `Button` variant
- Leave selects and toggles for Phase 10 (date picker migration)

### 5.5 TaskRow (buttons only)
**File**: `src/components/TaskRow.tsx`
- Delete button → `Button variant="ghost" size="icon"` + red class
- Other icon buttons → `Button variant="ghost" size="icon"`
- **Test**: Update `TaskRow.test.tsx` if button query selectors change

### 5.6 TaskInput (buttons only)
**File**: `src/components/TaskInput.tsx`
- Submit button → `Button variant="default"`
- Toolbar toggle buttons → `Button variant="ghost" size="sm"`
- **Test**: Update `TaskInput.test.tsx` if button query selectors change

### 5.7 Verification
- `npm run build` + `npm run test`
- Visual check: buttons look consistent in light/dark mode

---

## Phase 6: Migrate Checkboxes

### 6.1 TaskRow checkbox
**File**: `src/components/TaskRow.tsx`
- Custom `<button>` → shadcn `Checkbox` with `data-[state=checked]:bg-primary`
- **Test**: Update `TaskRow.test.tsx` — checkbox interaction changes from `click` on button to Radix checkbox role

### 6.2 SubtaskList checkbox
**File**: `src/components/SubtaskList.tsx`
- Same pattern as TaskRow, smaller size (`h-4 w-4`)

### 6.3 Verification
- `npm run build` + `npm run test`

---

## Phase 7: Migrate FilterDropdowns

### 7.1 FilterDropdowns → shadcn Select
**File**: `src/components/FilterDropdowns.tsx`
- Replace 3 native `<select>` elements with `Select` / `SelectTrigger` / `SelectContent` / `SelectItem`
- Add `Label` for each
- **Test**: Update `FilterDropdowns.test.tsx` — change from `fireEvent.change()` on native selects to `userEvent.click()` on Radix combobox triggers + `getByRole('option')`

### 7.2 Verification
- `npm run build` + `npm run test`

---

## Phase 8: Migrate Tabs & Toggles

### 8.1 FilterTabs → shadcn Tabs
**File**: `src/components/FilterTabs.tsx`
- Replace custom `role="tablist"` buttons with `Tabs` / `TabsList` / `TabsTrigger`
- Custom styling: transparent background, border-bottom active indicator
- No `TabsContent` needed (content rendering is external in MainLayout)
- **Test**: Update `FilterTabs.test.tsx` if role/interaction changes

### 8.2 ViewModeToggle → shadcn Tabs
**File**: `src/components/ViewModeToggle.tsx`
- Replace custom toggle buttons with `Tabs` / `TabsList` / `TabsTrigger`
- Use default TabsList pill styling (matches current background-highlight design)

### 8.3 Verification
- `npm run build` + `npm run test`

---

## Phase 9: Migrate Dialogs

### 9.1 KeyboardShortcutsModal → shadcn Dialog
**File**: `src/components/KeyboardShortcutsModal.tsx`
- Replace custom fixed overlay + content div with `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle`
- Add `Separator` before footer
- **Benefit**: Removes manual Escape listener and overlay click handler — Radix Dialog handles focus trap, escape, click-outside natively

### 9.2 DayTasksModal → shadcn Dialog
**File**: `src/components/calendar/DayTasksModal.tsx`
- Same Dialog migration
- Custom responsive classes on DialogContent: `h-full sm:h-auto sm:max-h-[80vh] rounded-none sm:rounded-lg`
- **Removes**: manual `useEffect` + `addEventListener('keydown')` for Escape
- **Test**: Update `DayTasksModal.test.tsx` — Radix Dialog renders via portal, so use `screen` queries instead of container queries

### 9.3 Verification
- `npm run build` + `npm run test`

---

## Phase 10: Migrate Collapsible Groups

### 10.1 TaskDateGroup → Card + Collapsible
**File**: `src/components/TaskDateGroup.tsx`
- Replace manual `useState` expand/collapse with `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent`
- Check whether expand/collapse state is purely local or controlled by parent — use `open`/`onOpenChange` if controlled
- Wrap task list in `Card`
- Trigger uses `Button variant="ghost"` via `asChild`

### 10.2 RecurringTaskGroup → Card + Collapsible
**File**: `src/components/RecurringTaskGroup.tsx`
- Same pattern as 10.1

### 10.3 Verification
- `npm run build` + `npm run test`

---

## Phase 11: Replace react-datepicker

### 11.1 TaskInput date picker
**File**: `src/components/TaskInput.tsx`
- Replace `import DatePicker from 'react-datepicker'` with the custom `DatePicker` composite from `src/components/ui/date-picker.tsx`
- **Test**: Update `TaskInput.test.tsx` — react-datepicker input field → Calendar popover button trigger

### 11.2 RecurrencePicker date picker + controls
**File**: `src/components/RecurrencePicker.tsx`
- Replace react-datepicker with custom `DatePicker` composite
- Migrate frequency `<select>` → shadcn `Select`
- Migrate day-of-week toggle buttons → shadcn `Toggle` with `pressed`/`onPressedChange`
- **Test**: Update `RecurrencePicker.test.tsx` — date picker + native select interactions change

### 11.3 Verification
- `npm run build` + `npm run test`
- Manual: add task with due date (Calendar popover opens, date selects correctly), set recurrence end date

---

## Phase 12: Replace react-hot-toast with Sonner

### 12.1 Swap Toaster provider
**File**: `src/App.tsx`
- Replace `<Toaster>` import from react-hot-toast with `<Toaster>` from `@/components/ui/sonner`
- **Test**: Update `App.test.tsx` — Toaster component swap

### 12.2 Rewrite toast calls
**File**: `src/hooks/useTasks.tsx`
- Replace each `toast()` call with Sonner API
- Key API difference: react-hot-toast uses `toast((t) => <JSX>)` callback pattern. Sonner uses `toast('message', { action: { label, onClick } })` object pattern
- Rewrite undo logic in `deleteTask` and `toggleComplete` with the Sonner action pattern
- Preserve toast styling: navy background, white text, purple action button color via Toaster `toastOptions`

### 12.3 Verification
- `npm run build` + `npm run test`
- Manual: delete task (Sonner toast appears with working Undo), complete task (Sonner toast with Undo)

---

## Phase 13: Migrate SearchBar

### 13.1 SearchBar
**File**: `src/components/SearchBar.tsx`
- Replace native `<input>` with shadcn `Input`
- Keep the icon prefix/suffix wrapper layout (shadcn Input has no built-in slots)
- Preserve `forwardRef` (used by MainLayout for keyboard shortcut focus)
- Clear button → `Button variant="ghost" size="icon"`
- **Test**: Update `SearchBar.test.tsx` if input query selectors change

### 13.2 Verification
- `npm run build` + `npm run test`

---

## Phase 14: Migrate TaskInput (remaining elements)

### 14.1 TaskInput inputs and container
**File**: `src/components/TaskInput.tsx`
- Main text input → shadcn `Input` (borderless, no ring)
- Description textarea → shadcn `Textarea`
- Tag name input → shadcn `Input`
- Subtask inline input → shadcn `Input`
- Outer container → shadcn `Card`
- **Test**: Update `TaskInput.test.tsx` if DOM queries change
- **Test**: Update `MainLayout.test.tsx` if DOM structure changes affect integration queries

### 14.2 Verification
- `npm run build` + `npm run test`
- Manual: full task creation flow (title, priority, date, categories, notes, subtasks, recurrence)

---

## Phase 15: Cleanup

### 15.1 Remove unused dependencies
```bash
npm uninstall react-datepicker @types/react-datepicker react-hot-toast
```

### 15.2 Final index.css audit
Verify only CSS variable definitions + global styles remain. No react-datepicker overrides, no unused component classes.

### 15.3 Update barrel exports
Review `src/components/index.ts` — ensure all exports are correct. Currently missing exports for: `FilterDropdowns`, `EditableText`, `RecurrencePicker`, `RecurrenceBadge`, `RecurringTaskGroup`, `DayTasksModal`, `SearchBar`.

### 15.4 Remove unused imports
Final pass through all migrated files to strip stale imports.

### 15.5 Final verification
```bash
npm run test        # all 19 test files pass
npm run build       # clean production build
npm run dev         # manual testing checklist (see below)
```

---

## Manual Testing Checklist

Verify in **both light and dark mode**:

- [ ] Theme: purple accent, gray/slate backgrounds, purple focus rings
- [ ] Task creation: title, priority, date (Calendar popover), categories, notes, subtasks, recurrence
- [ ] Task completion: checkbox toggles, Sonner toast with working Undo
- [ ] Task deletion: Sonner toast with working Undo
- [ ] Inline editing: click title/description to edit, Enter saves, Escape cancels
- [ ] Filters: tab switching (Current/Overdue/Completed), dropdown filters, search + clear
- [ ] Calendar view: month navigation, Today button, click day → Dialog with tasks
- [ ] Dialogs: Escape closes, click-outside closes, focus trap works
- [ ] Collapsible sections: expand/collapse TaskDateGroup + RecurringTaskGroup
- [ ] Keyboard shortcuts: `?` opens modal, all shortcuts work
- [ ] Responsive: usable at 320px–768px mobile viewport
- [ ] Accessibility: tab navigation, visible focus, aria-labels, screen reader announcements

---

## Files Summary

**New files**: 20 (1 util, 1 config, 17 shadcn ui components, 1 custom DatePicker composite)

**Modified files**: 24 (4 config, 1 hook, 19 components)

**Dependencies added**: 16 (`tailwind-merge`, `clsx`, `class-variance-authority`, `tailwindcss-animate`, `@radix-ui/react-slot`, `react-checkbox`, `react-dialog`, `react-label`, `react-popover`, `react-select`, `react-separator`, `react-tabs`, `react-toggle`, `react-collapsible`, `react-day-picker`, `sonner`)

**Dependencies removed**: 3 (`react-datepicker`, `@types/react-datepicker`, `react-hot-toast`)
