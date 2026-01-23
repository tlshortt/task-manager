import { useState } from 'react';
import type { Task } from '@/types';
import { TaskRow } from './TaskRow';
import { ChevronDown } from 'lucide-react';

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
        className="w-full flex items-center justify-between mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label} tasks`}
      >
        <span>
          {label} ({count})
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Card wrapper with tasks */}
      {isExpanded && (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
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
