import { useState } from 'react';
import Check from 'lucide-react/dist/esm/icons/check';
import Plus from 'lucide-react/dist/esm/icons/plus';
import X from 'lucide-react/dist/esm/icons/x';
import type { Subtask } from '@/types';

interface SubtaskListProps {
  subtasks: Subtask[];
  onUpdate: (subtasks: Subtask[]) => void;
  disabled?: boolean;
}

export function SubtaskList({ subtasks, onUpdate, disabled }: SubtaskListProps) {
  const [newSubtask, setNewSubtask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleToggle = (id: string) => {
    const updated = subtasks.map((st) =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    onUpdate(updated);
  };

  const handleDelete = (id: string) => {
    onUpdate(subtasks.filter((st) => st.id !== id));
  };

  const handleAdd = () => {
    if (!newSubtask.trim()) return;
    const subtask: Subtask = {
      id: crypto.randomUUID(),
      title: newSubtask.trim(),
      completed: false,
    };
    onUpdate([...subtasks, subtask]);
    setNewSubtask('');
    setIsAdding(false);
  };

  const completedCount = subtasks.filter((st) => st.completed).length;

  return (
    <div className="mt-2 ml-8 space-y-1">
      {subtasks.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {completedCount}/{subtasks.length} completed
        </div>
      )}
      {subtasks.map((subtask) => (
        <div
          key={subtask.id}
          className="group flex items-center gap-2 py-1"
        >
          <button
            onClick={() => handleToggle(subtask.id)}
            disabled={disabled}
            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
              subtask.completed
                ? 'bg-purple-600 border-purple-600 dark:bg-purple-500'
                : 'border-gray-300 dark:border-gray-500 hover:border-purple-400'
            }`}
            aria-label={subtask.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {subtask.completed && <Check className="w-3 h-3 text-white" />}
          </button>
          <span
            className={`text-sm flex-1 ${
              subtask.completed
                ? 'line-through text-gray-400 dark:text-gray-500'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {subtask.title}
          </span>
          <button
            onClick={() => handleDelete(subtask.id)}
            disabled={disabled}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-opacity"
            aria-label="Delete subtask"
          >
            <X className="w-3 h-3 text-red-500" />
          </button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewSubtask('');
              }
            }}
            placeholder="Add subtask..."
            className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />
          <button
            onClick={handleAdd}
            className="p-1 bg-purple-600 text-white rounded hover:bg-purple-700"
            aria-label="Add subtask"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewSubtask('');
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          disabled={disabled}
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 py-1"
        >
          <Plus className="w-3 h-3" />
          Add subtask
        </button>
      )}
    </div>
  );
}
