import type { Task } from '@/types';
import { Play, Check, Trash2 } from 'lucide-react';

interface TaskRowProps {
  task: Task;
  onToggle: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function formatTime(minutes?: number): string {
  if (!minutes) return '--';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}hr ${mins}m`;
  } else if (hours > 0) {
    return `${hours}hr`;
  } else {
    return `${mins}m`;
  }
}

function getPriorityColor(priority: Task['priority']): string {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-gray-400';
  }
}

export function TaskRow({ task, onToggle, onUpdate, onDelete }: TaskRowProps) {
  return (
    <div className="group flex items-center py-4 px-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      {/* Checkbox */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={() => onToggle(task)}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-purple-600 border-purple-600'
              : 'border-gray-300 hover:border-purple-400'
          }`}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && (
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          )}
        </button>

        {/* Priority dot */}
        <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />

        {/* Title */}
        <span
          className={`text-sm ${
            task.completed ? 'line-through text-gray-400' : 'text-gray-900'
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Estimated time */}
      <div className="w-28 text-sm text-gray-600 text-center tabular-nums">
        {formatTime(task.estimatedMinutes)}
      </div>

      {/* Consumed time */}
      <div className="w-28 text-sm text-gray-600 text-center tabular-nums">
        {formatTime(task.consumedMinutes)}
      </div>

      {/* Action icons */}
      <div className="w-24 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onUpdate(task)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label="Start timer"
        >
          <Play className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => onToggle(task)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <Check className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-1 hover:bg-red-100 rounded transition-colors"
          aria-label="Delete task"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
  );
}
