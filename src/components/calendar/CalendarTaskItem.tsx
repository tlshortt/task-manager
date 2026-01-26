import type { Task, Priority } from '@/types';

interface CalendarTaskItemProps {
  task: Task;
}

function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-gray-400';
  }
}

export function CalendarTaskItem({ task }: CalendarTaskItemProps) {
  return (
    <div
      className={`
        flex items-center gap-1 text-xs truncate
        ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
      <span className="truncate">{task.title}</span>
    </div>
  );
}
