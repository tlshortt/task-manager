import { useState } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { RecurrencePattern } from '@/types';

interface RecurrencePickerProps {
  value?: RecurrencePattern;
  onChange: (pattern?: RecurrencePattern) => void;
  onClose?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

export function RecurrencePicker({ value, onChange, onClose }: RecurrencePickerProps) {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | undefined>(
    value?.frequency
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(value?.daysOfWeek || []);
  const [endDate, setEndDate] = useState<Date | undefined>(value?.endDate);

  const handleFrequencyChange = (newFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined) => {
    setFrequency(newFrequency);

    if (!newFrequency) {
      onChange(undefined);
      return;
    }

    const pattern: RecurrencePattern = {
      frequency: newFrequency,
      interval: 1,
      endDate,
    };

    if (newFrequency === 'weekly') {
      pattern.daysOfWeek = daysOfWeek.length > 0 ? daysOfWeek : [new Date().getDay()];
      setDaysOfWeek(pattern.daysOfWeek);
    }

    if (newFrequency === 'monthly') {
      pattern.dayOfMonth = new Date().getDate();
    }

    onChange(pattern);
  };

  const handleDayToggle = (day: number) => {
    const newDays = daysOfWeek.includes(day)
      ? daysOfWeek.filter((d) => d !== day)
      : [...daysOfWeek, day];

    setDaysOfWeek(newDays);

    if (frequency === 'weekly' && newDays.length > 0) {
      onChange({
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: newDays,
        endDate,
      });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    const newEndDate = date || undefined;
    setEndDate(newEndDate);

    if (frequency) {
      const pattern: RecurrencePattern = {
        frequency,
        interval: 1,
        endDate: newEndDate,
      };

      if (frequency === 'weekly') {
        pattern.daysOfWeek = daysOfWeek;
      }

      if (frequency === 'monthly') {
        pattern.dayOfMonth = new Date().getDate();
      }

      onChange(pattern);
    }
  };

  const handleClear = () => {
    setFrequency(undefined);
    setDaysOfWeek([]);
    setEndDate(undefined);
    onChange(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  return (
    <div className="space-y-3" onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Repeat
        </label>
        {frequency && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label="Clear recurrence"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-2">
        <select
          value={frequency || ''}
          onChange={(e) =>
            handleFrequencyChange(
              e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined || undefined
            )
          }
          className="w-full text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
          aria-label="Recurrence frequency"
        >
          <option value="">None</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        {frequency === 'weekly' && (
          <div className="space-y-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Repeat on:
            </label>
            <div className="flex gap-2 flex-wrap">
              {DAYS_OF_WEEK.map(({ value: day, label }) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    daysOfWeek.includes(day)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-400'
                  }`}
                  aria-pressed={daysOfWeek.includes(day)}
                  aria-label={`Repeat on ${label}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {frequency && (
          <div className="space-y-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Ends on (optional):
            </label>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                dateFormat="MMM d, yyyy"
                placeholderText="Never"
                minDate={new Date()}
                className="w-full text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                aria-label="Recurrence end date"
              />
              {endDate && (
                <button
                  type="button"
                  onClick={() => handleEndDateChange(null)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  aria-label="Clear end date"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
