import type { CalendarDay } from '@/utils/calendarUtils';
import { hasOverdueTasks } from '@/utils/calendarUtils';
import { format } from 'date-fns';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarGridProps {
  days: CalendarDay[];
  onDayClick?: (day: CalendarDay) => void;
}

export function CalendarGrid({ days, onDayClick }: CalendarGridProps) {
  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
      {/* Day-of-week headers */}
      {DAYS_OF_WEEK.map((day) => (
        <div
          key={day}
          className="bg-gray-50 dark:bg-gray-800 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
        >
          {day}
        </div>
      ))}

      {/* Calendar day cells */}
      {days.map((day) => {
        const isOverdue = hasOverdueTasks(day.tasks, day.date);
        const taskCount = day.tasks.length;

        return (
          <button
            key={day.date.toISOString()}
            onClick={() => onDayClick?.(day)}
            className={`
              min-h-[80px] p-2 text-left transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500
              ${day.isCurrentMonth
                ? 'bg-white dark:bg-gray-900'
                : 'bg-gray-50 dark:bg-gray-800/50'
              }
              ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''}
              hover:bg-gray-100 dark:hover:bg-gray-800
            `}
          >
            <div className="flex items-start justify-between">
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
          </button>
        );
      })}
    </div>
  );
}
