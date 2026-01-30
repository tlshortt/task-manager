import { useState } from 'react';
import type { Task } from '@/types';
import { TaskRow } from './TaskRow';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Repeat from 'lucide-react/dist/esm/icons/repeat';

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
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-2 min-h-[44px]"
        aria-expanded={isExpanded}
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
      </button>

      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden" role="region" aria-label={`${label} recurring tasks`}>
          <TaskRow
            task={task}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
            tagsById={tagsById}
          />
        </div>
      )}
    </div>
  );
}
