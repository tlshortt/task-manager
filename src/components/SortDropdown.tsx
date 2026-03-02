import { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import type { SortField, SortDirection } from '@/types';

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
  { value: 'createdAt', label: 'Created Date' },
];

interface SortDropdownProps {
  field: SortField;
  direction: SortDirection;
  onSelectField: (field: SortField) => void;
  onToggleDirection: () => void;
}

export function SortDropdown({ field, direction, onSelectField, onToggleDirection }: SortDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedField: SortField) => {
    if (selectedField === field) {
      onToggleDirection();
    } else {
      onSelectField(selectedField);
    }
    setOpen(false);
  };

  const DirectionIcon = direction === 'asc' ? ArrowUp : ArrowDown;
  const isNonDefault = field !== 'dueDate' || direction !== 'asc';
  const activeLabel = SORT_OPTIONS.find(o => o.value === field)?.label;

  return (
    <div className="flex flex-col gap-1 w-full sm:w-48">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sort by
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Sort by"
            className={`w-full sm:w-48 h-11 justify-between font-normal ${isNonDefault ? 'border-primary/50 bg-primary/5 text-primary' : ''}`}
          >
            <span className="flex items-center gap-1.5">
              Sort: {activeLabel}
              <DirectionIcon className="h-3.5 w-3.5" />
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="start">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {option.value === field ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="w-3.5" />
                )}
                {option.label}
              </span>
              {option.value === field && (
                <DirectionIcon className="h-3.5 w-3.5" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
