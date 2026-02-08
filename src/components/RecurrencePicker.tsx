import { useState } from 'react';
import type { RecurrencePattern } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';

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

  const handleEndDateChange = (date?: Date) => {
    setEndDate(date);

    if (frequency) {
      const pattern: RecurrencePattern = {
        frequency,
        interval: 1,
        endDate: date,
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 h-auto px-1 py-0"
            aria-label="Clear recurrence"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Select
          value={frequency || 'none'}
          onValueChange={(val) =>
            handleFrequencyChange(
              val === 'none' ? undefined : val as 'daily' | 'weekly' | 'monthly' | 'yearly'
            )
          }
        >
          <SelectTrigger aria-label="Recurrence frequency" className="w-full text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>

        {frequency === 'weekly' && (
          <div className="space-y-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Repeat on:
            </label>
            <div className="flex gap-2 flex-wrap">
              {DAYS_OF_WEEK.map(({ value: day, label }) => (
                <Toggle
                  key={day}
                  pressed={daysOfWeek.includes(day)}
                  onPressedChange={() => handleDayToggle(day)}
                  size="sm"
                  className={`px-3 py-1.5 text-xs ${
                    daysOfWeek.includes(day)
                      ? 'bg-purple-600 text-white data-[state=on]:bg-purple-600 data-[state=on]:text-white'
                      : ''
                  }`}
                  aria-label={`Repeat on ${label}`}
                >
                  {label}
                </Toggle>
              ))}
            </div>
          </div>
        )}

        {frequency && (
          <div className="space-y-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Ends on (optional):
            </label>
            <DatePicker
              date={endDate}
              onDateChange={handleEndDateChange}
              placeholder="Never"
              minDate={new Date()}
              className="w-full text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
