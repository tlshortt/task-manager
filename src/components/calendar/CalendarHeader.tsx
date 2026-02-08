import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { format, isSameMonth } from 'date-fns';
import { Button } from '@/components/ui/button';

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
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          disabled={isCurrentMonth}
        >
          Today
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
