import { useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import X from 'lucide-react/dist/esm/icons/x';
import type { Task } from '@/types';
import { TaskRow } from '../TaskRow';

interface DayTasksModalProps {
  isOpen: boolean;
  date: Date;
  tasks: Task[];
  onClose: () => void;
  onToggle: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function DayTasksModal({
  isOpen,
  date,
  tasks,
  onClose,
  onToggle,
  onUpdate,
  onDelete,
}: DayTasksModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-none sm:rounded-xl shadow-xl max-w-2xl w-full h-full sm:h-auto sm:mx-4 sm:max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formattedDate}
          </h2>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors active:bg-gray-200 dark:active:bg-gray-600 flex items-center justify-center touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No tasks for this day
            </div>
          ) : (
            <div>
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
