import type { CategoryFilter, PriorityFilter, RecurrenceFilter, SortField, SortDirection, Tag } from '@/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortDropdown } from './SortDropdown';

interface FilterDropdownsProps {
  tags: Tag[] | undefined;
  recurrence: RecurrenceFilter;
  category: CategoryFilter;
  priority: PriorityFilter;
  onRecurrenceChange: (value: RecurrenceFilter) => void;
  onCategoryChange: (value: CategoryFilter) => void;
  onPriorityChange: (value: PriorityFilter) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionToggle: () => void;
}

export function FilterDropdowns({
  tags,
  recurrence,
  category,
  priority,
  onRecurrenceChange,
  onCategoryChange,
  onPriorityChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionToggle,
}: FilterDropdownsProps) {
  const sortedTags = tags ? [...tags].sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="flex flex-col gap-1 w-full sm:w-48">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recurrence
        </Label>
        <Select value={recurrence} onValueChange={(value) => onRecurrenceChange(value as RecurrenceFilter)}>
          <SelectTrigger aria-label="Recurrence" className="w-full sm:w-48 h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="recurring">Recurring</SelectItem>
            <SelectItem value="non-recurring">Non-recurring</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1 w-full sm:w-48">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </Label>
        <Select value={category} onValueChange={(value) => onCategoryChange(value as CategoryFilter)}>
          <SelectTrigger aria-label="Category" className="w-full sm:w-48 h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            {sortedTags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1 w-full sm:w-48">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Priority
        </Label>
        <Select value={priority} onValueChange={(value) => onPriorityChange(value as PriorityFilter)}>
          <SelectTrigger aria-label="Priority" className="w-full sm:w-48 h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SortDropdown
        field={sortField}
        direction={sortDirection}
        onSelectField={onSortFieldChange}
        onToggleDirection={onSortDirectionToggle}
      />
    </div>
  );
}
