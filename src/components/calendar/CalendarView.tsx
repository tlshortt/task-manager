import { useState, useMemo } from 'react';
import { addMonths, subMonths, startOfMonth } from 'date-fns';
import type { Task } from '@/types';
import { generateCalendarDays, getTasksForDate } from '@/utils/calendarUtils';
import type { CalendarDay as CalendarDayType } from '@/utils/calendarUtils';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import { DayTasksModal } from './DayTasksModal';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarViewProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function CalendarView({ tasks, onToggle, onUpdate, onDelete }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
    setSelectedDate(day.date);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  const selectedDateTasks = useMemo(
    () => (selectedDate ? getTasksForDate(tasks, selectedDate) : []),
    [tasks, selectedDate]
  );

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
            className="bg-gray-50 dark:bg-gray-800 py-1.5 sm:py-2 text-center text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400"
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

      {selectedDate && (
        <DayTasksModal
          isOpen={selectedDate !== null}
          date={selectedDate}
          tasks={selectedDateTasks}
          onClose={handleCloseModal}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
