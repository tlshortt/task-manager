import type { CalendarDay as CalendarDayType } from '@/utils/calendarUtils';
import { hasOverdueTasks } from '@/utils/calendarUtils';
import type { Priority } from '@/types';
import { format } from 'date-fns';

const MAX_TASK_PREVIEWS = 2;

interface CalendarDayProps {
  day: CalendarDayType;
  onClick?: () => void;
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

export function CalendarDay({ day, onClick }: CalendarDayProps) {
  const isOverdue = hasOverdueTasks(day.tasks, day.date);
  const taskCount = day.tasks.length;
  const visibleTasks = day.tasks.slice(0, MAX_TASK_PREVIEWS);
  const remainingCount = taskCount - MAX_TASK_PREVIEWS;

  return (
    <button
      onClick={onClick}
      className={`
        min-h-[100px] p-2 text-left transition-colors duration-150 flex flex-col
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500
        ${day.isCurrentMonth
          ? 'bg-white dark:bg-gray-900'
          : 'bg-gray-50 dark:bg-gray-800/50'
        }
        ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''}
        hover:bg-gray-100 dark:hover:bg-gray-800
      `}
    >
      {/* Header: date number and task count */}
      <div className="flex items-start justify-between mb-1">
        <span
          className={`
            inline-flex items-center justify-center w-7 h-7 text-sm rounded-full
            ${day.isToday
              ? 'bg-purple-600 text-white font-semibold ring-2 ring-purple-300 dark:ring-purple-500'
              : day.isCurrentMonth
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-400 dark:text-gray-600'
            }
          `}
        >
          {format(day.date, 'd')}
        </span>
        {taskCount > 0 && (
          <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-medium px-1.5 py-0.5 rounded-full">
            {taskCount}
          </span>
        )}
      </div>

      {/* Priority dots */}
      {taskCount > 0 && (
        <div className="flex gap-1 mb-1">
          {day.tasks.slice(0, 5).map((task) => (
            <span
              key={task.id}
              className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
              title={task.title}
            />
          ))}
          {taskCount > 5 && (
            <span className="text-xs text-gray-400">+{taskCount - 5}</span>
          )}
        </div>
      )}

      {/* Task previews */}
      <div className="flex-1 overflow-hidden space-y-0.5">
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            className={`
              flex items-center gap-1 text-xs truncate
              ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}
            `}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
            <span className="truncate">{task.title}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            +{remainingCount} more
          </div>
        )}
      </div>
    </button>
  );
}
