import type { Task } from '@/types';
import { Check, Trash2 } from 'lucide-react';

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

export function TaskRow({ task, onToggle, onUpdate: _onUpdate, onDelete }: TaskRowProps) {
  return (
    <div className="group flex items-center py-4 px-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
      {/* Check button */}
      <button
        onClick={() => onToggle(task)}
        className={`p-2 min-w-[44px] min-h-[44px] rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center flex-shrink-0 mr-2 ${
          task.completed
            ? 'bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800'
            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        aria-label={task.completed ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
      >
        <Check className={`w-4 h-4 ${task.completed ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'}`} />
      </button>

      {/* Task info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Priority dot */}
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`}
          aria-label={`${task.priority} priority`}
          role="img"
        />

        {/* Title */}
        <span
          className={`text-sm truncate ${
            task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Estimated time */}
      <div className="w-20 sm:w-28 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center tabular-nums flex-shrink-0" aria-label={`Estimated ${formatTime(task.estimatedMinutes)}`}>
        {formatTime(task.estimatedMinutes)}
      </div>

      {/* Consumed time */}
      <div className="w-20 sm:w-28 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center tabular-nums flex-shrink-0" aria-label={`Consumed ${formatTime(task.consumedMinutes)}`}>
        {formatTime(task.consumedMinutes)}
      </div>

      {/* Action icons */}
      <div className="w-16 sm:w-24 flex items-center justify-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onDelete(task)}
          className="p-2 min-w-[44px] min-h-[44px] hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center"
          aria-label={`Delete ${task.title}`}
        >
          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
}
