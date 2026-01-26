import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { format, isSameMonth } from 'date-fns';

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  const today = new Date();
  const isCurrentMonth = isSameMonth(currentMonth, today);

  return (
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <h2 className="text-base sm:text-xl font-semibold text-navy-900 dark:text-white">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <div className="flex items-center gap-2">
        <button
          onClick={onToday}
          disabled={isCurrentMonth}
          className={`
            min-h-[44px] min-w-[44px] px-3 py-2 text-sm rounded-md transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
            active:bg-purple-100 dark:active:bg-purple-900/30
            ${
              isCurrentMonth
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
            }
          `}
        >
          Today
        </button>
        <div className="flex gap-1">
          <button
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="min-h-[44px] min-w-[44px] p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 active:bg-gray-200 dark:active:bg-gray-700 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNextMonth}
            aria-label="Next month"
            className="min-h-[44px] min-w-[44px] p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 active:bg-gray-200 dark:active:bg-gray-700 flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
