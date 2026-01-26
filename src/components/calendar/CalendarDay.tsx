import type { CalendarDay as CalendarDayType } from '@/utils/calendarUtils';
import { hasOverdueTasks } from '@/utils/calendarUtils';
import type { Priority } from '@/types';
import { format } from 'date-fns';
import { CalendarTaskItem } from './CalendarTaskItem';

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
        min-h-[44px] sm:min-h-[100px] p-0.5 sm:p-2 text-left transition-colors duration-150 flex flex-col
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500
        active:bg-gray-100 dark:active:bg-gray-800 touch-manipulation
        ${day.isCurrentMonth
          ? 'bg-white dark:bg-gray-900'
          : 'bg-gray-50 dark:bg-gray-800/50'
        }
        ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''}
        hover:bg-gray-100 dark:hover:bg-gray-800
      `}
    >
      {/* Header: date number and task count */}
      <div className="flex items-start justify-between gap-0.5 sm:gap-1">
        <span
          className={`
            inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 text-[10px] sm:text-sm rounded-full flex-shrink-0
            ${day.isToday
              ? 'bg-purple-600 text-white font-semibold ring-1 sm:ring-2 ring-purple-300 dark:ring-purple-500'
              : day.isCurrentMonth
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-400 dark:text-gray-600'
            }
          `}
        >
          {format(day.date, 'd')}
        </span>
        {taskCount > 0 && (
          <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[8px] sm:text-xs font-medium px-1 sm:px-1.5 py-0.5 rounded-full flex-shrink-0">
            {taskCount}
          </span>
        )}
      </div>

      {/* Priority dots - hidden on mobile */}
      {taskCount > 0 && (
        <div className="hidden sm:flex gap-1 mb-1 mt-1">
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

      {/* Task previews - hidden on mobile */}
      <div className="hidden sm:block flex-1 overflow-hidden space-y-0.5 mt-1">
        {visibleTasks.map((task) => (
          <CalendarTaskItem key={task.id} task={task} />
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
