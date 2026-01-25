import { useState } from 'react';
import type { Task } from '@/types';
import { TaskRow } from './TaskRow';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';

interface TaskDateGroupProps {
  label: string;
  count: number;
  tasks: Task[];
  onToggle: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskDateGroup({
  label,
  count,
  tasks,
  onToggle,
  onUpdate,
  onDelete,
}: TaskDateGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-2 min-h-[44px]"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label} tasks (${count})`}
      >
        <span>
          {label} ({count})
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Card wrapper with tasks */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden" role="region" aria-label={`${label} tasks`}>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
