import { useState, useMemo } from 'react';
import { addMonths, subMonths, startOfMonth } from 'date-fns';
import type { Task } from '@/types';
import { generateCalendarDays } from '@/utils/calendarUtils';
import type { CalendarDay as CalendarDayType } from '@/utils/calendarUtils';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarViewProps {
  tasks: Task[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(startOfMonth(new Date()));
  };

  const calendarDays = useMemo(
    () => generateCalendarDays(currentMonth, tasks),
    [currentMonth, tasks]
  );

  const handleDayClick = (day: CalendarDayType) => {
    // Will be used in US-CAL-12 for modal
    console.log('Day clicked:', day.date);
  };

  return (
    <div className="w-full">
      <CalendarHeader
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />
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
        {calendarDays.map((day) => (
          <CalendarDay
            key={day.date.toISOString()}
            day={day}
            onClick={() => handleDayClick(day)}
          />
        ))}
      </div>
    </div>
  );
}
