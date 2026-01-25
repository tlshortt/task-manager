import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import type { Priority } from '@/types';

interface TaskInputProps {
  onAddTask: (title: string, dueDate?: Date, priority?: Priority) => void;
}

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim(), dueDate, priority);
      setTitle('');
      setDueDate(undefined);
      setShowDatePicker(false);
      setPriority('medium');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      setDueDate(new Date(dateValue));
    } else {
      setDueDate(undefined);
    }
  };

  const handleEscape = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDatePicker(false);
      setTitle('');
      setDueDate(undefined);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <button
          type="submit"
          aria-label="Add task"
          disabled={!title.trim()}
          className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            handleKeyDown(e);
            handleEscape(e);
          }}
          placeholder="Add a new task..."
          aria-label="New task title"
          className="flex-1 border-0 focus:ring-0 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 min-h-[44px] py-2"
        />

        {/* Priority picker */}
        <div className="flex items-center gap-1.5 px-2" role="radiogroup" aria-label="Task priority">
          {(['low', 'medium', 'high'] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              aria-label={`${p} priority`}
              aria-checked={priority === p}
              role="radio"
              className={`w-4 h-4 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
                p === 'low' ? 'bg-gray-400' : p === 'medium' ? 'bg-amber-500' : 'bg-red-500'
              } ${priority === p ? 'ring-2 ring-offset-1 ring-purple-500 scale-110' : 'opacity-50 hover:opacity-75'}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          aria-label={showDatePicker ? 'Hide deadline picker' : 'Show deadline picker'}
          aria-expanded={showDatePicker}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-2 min-h-[44px]"
        >
          <Calendar className="w-4 h-4" />
          <span>Set deadline</span>
        </button>
      </form>

      {showDatePicker && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <input
            type="date"
            value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
            onChange={handleDateChange}
            onKeyDown={handleEscape}
            aria-label="Task deadline"
            className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:ring-offset-2 min-h-[44px]"
          />
        </div>
      )}
    </div>
  );
}
