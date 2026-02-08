import { useState } from 'react';
import Plus from 'lucide-react/dist/esm/icons/plus';
import X from 'lucide-react/dist/esm/icons/x';
import Check from 'lucide-react/dist/esm/icons/check';
import type { Subtask } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
          <Checkbox
            checked={subtask.completed}
            onCheckedChange={() => handleToggle(subtask.id)}
            disabled={disabled}
            className="h-4 w-4 data-[state=checked]:bg-primary"
            aria-label={subtask.completed ? 'Mark incomplete' : 'Mark complete'}
          />
          <span
            className={`text-sm flex-1 ${
              subtask.completed
                ? 'line-through text-gray-400 dark:text-gray-500'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {subtask.title}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(subtask.id)}
            disabled={disabled}
            className="opacity-0 group-hover:opacity-100 h-6 w-6 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-opacity"
            aria-label="Delete subtask"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
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
            className="flex-1 text-sm h-8"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleAdd}
            aria-label="Add subtask"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsAdding(false);
              setNewSubtask('');
            }}
            className="h-8 w-8"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 h-auto py-1 px-0"
        >
          <Plus className="w-3 h-3" />
          Add subtask
        </Button>
      )}
    </div>
  );
}
