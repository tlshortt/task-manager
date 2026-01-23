import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';

interface TaskInputProps {
  onAddTask: (title: string, dueDate?: Date) => void;
}

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim(), dueDate);
      setTitle('');
      setDueDate(undefined);
      setShowDatePicker(false);
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

  return (
    <div className="bg-white rounded-xl shadow-card p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Plus className="w-5 h-5 text-purple-600 flex-shrink-0" />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
          className="flex-1 border-0 focus:ring-0 focus:outline-none placeholder:text-gray-400 text-gray-900"
        />

        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span>Set deadline</span>
        </button>
      </form>

      {showDatePicker && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <input
            type="date"
            value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
            onChange={handleDateChange}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      )}
    </div>
  );
}
