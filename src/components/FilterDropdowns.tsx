import type { CategoryFilter, PriorityFilter, RecurrenceFilter, Tag } from '@/types';

interface FilterDropdownsProps {
  tags: Tag[] | undefined;
  recurrence: RecurrenceFilter;
  category: CategoryFilter;
  priority: PriorityFilter;
  onRecurrenceChange: (value: RecurrenceFilter) => void;
  onCategoryChange: (value: CategoryFilter) => void;
  onPriorityChange: (value: PriorityFilter) => void;
}

export function FilterDropdowns({
  tags,
  recurrence,
  category,
  priority,
  onRecurrenceChange,
  onCategoryChange,
  onPriorityChange,
}: FilterDropdownsProps) {
  const sortedTags = tags ? [...tags].sort((a, b) => a.name.localeCompare(b.name)) : [];
  const selectClassName =
    'w-full sm:w-48 h-11 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-900';

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="flex flex-col gap-1 w-full sm:w-48">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recurrence
        </label>
        <select
          aria-label="Recurrence"
          value={recurrence}
          onChange={(event) => onRecurrenceChange(event.target.value as RecurrenceFilter)}
          className={selectClassName}
        >
          <option value="all">All</option>
          <option value="recurring">Recurring</option>
          <option value="non-recurring">Non-recurring</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 w-full sm:w-48">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          aria-label="Category"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value as CategoryFilter)}
          className={selectClassName}
        >
          <option value="all">All</option>
          <option value="uncategorized">Uncategorized</option>
          {sortedTags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1 w-full sm:w-48">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Priority
        </label>
        <select
          aria-label="Priority"
          value={priority}
          onChange={(event) => onPriorityChange(event.target.value as PriorityFilter)}
          className={selectClassName}
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  );
}
