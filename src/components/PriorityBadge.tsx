import type { Priority } from '@/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colorMap: Record<Priority, string> = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-gray-400'
  };

  return <span className={cn('w-2 h-2 rounded-full inline-block mr-2', colorMap[priority])} />;
}
