import Repeat from 'lucide-react/dist/esm/icons/repeat';
import type { RecurrencePattern } from '@/types';

interface RecurrenceBadgeProps {
  pattern: RecurrencePattern;
  size?: 'sm' | 'md';
}

function getPatternLabel(pattern: RecurrencePattern): string {
  const { frequency, interval, daysOfWeek } = pattern;

  switch (frequency) {
    case 'daily':
      return interval === 1 ? 'Daily' : `Every ${interval} days`;

    case 'weekly':
      if (interval === 1) {
        if (daysOfWeek && daysOfWeek.length === 7) {
          return 'Daily';
        }
        return 'Weekly';
      }
      return `Every ${interval} weeks`;

    case 'monthly':
      return interval === 1 ? 'Monthly' : `Every ${interval} months`;

    case 'yearly':
      return interval === 1 ? 'Yearly' : `Every ${interval} years`;

    default:
      return 'Recurring';
  }
}

export function RecurrenceBadge({ pattern, size = 'sm' }: RecurrenceBadgeProps) {
  const label = getPatternLabel(pattern);
  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 ${sizeClasses}`}
      aria-label={`Recurring task: ${label}`}
    >
      <Repeat className="w-3 h-3" />
      {label}
    </span>
  );
}
