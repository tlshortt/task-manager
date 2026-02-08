import { format } from 'date-fns';
import type { Task } from '@/types';
import { TaskRow } from '../TaskRow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DayTasksModalProps {
  isOpen: boolean;
  date: Date;
  tasks: Task[];
  onClose: () => void;
  onToggle: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (task: Task) => void;
  tagsById?: Record<string, import('@/types').Tag>;
}

export function DayTasksModal({
  isOpen,
  date,
  tasks,
  onClose,
  onToggle,
  onUpdate,
  onDelete,
  tagsById,
}: DayTasksModalProps) {
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl h-full sm:h-auto sm:max-h-[80vh] rounded-none sm:rounded-lg p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-sm sm:text-lg">
            {formattedDate}
          </DialogTitle>
        </DialogHeader>

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
                  tagsById={tagsById}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
