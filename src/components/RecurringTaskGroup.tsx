import { useState } from 'react';
import type { Task } from '@/types';
import { TaskRow } from './TaskRow';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Repeat from 'lucide-react/dist/esm/icons/repeat';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface RecurringTaskGroupProps {
  label: string;
  count: number;
  task: Task;
  onToggle: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (task: Task) => void;
  tagsById?: Record<string, import('@/types').Tag>;
}

export function RecurringTaskGroup({
  label,
  count,
  task,
  onToggle,
  onUpdate,
  onDelete,
  tagsById,
}: RecurringTaskGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="mb-6">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 px-2 py-2 min-h-[44px] h-auto"
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label} recurring tasks (${count} occurrences)`}
        >
          <span className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-purple-500" aria-hidden="true" />
            {label} ({count} occurrences)
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <Card className="overflow-hidden p-0" role="region" aria-label={`${label} recurring tasks`}>
          <TaskRow
            task={task}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
            tagsById={tagsById}
          />
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
