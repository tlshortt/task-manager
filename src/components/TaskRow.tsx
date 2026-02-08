import { useState } from 'react';
import type { Task, Subtask, Tag } from '@/types';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { format } from 'date-fns';
import { TagBadge } from './TagBadge';
import { SubtaskList } from './SubtaskList';
import { EditableText } from './EditableText';
import { RecurrenceBadge } from './RecurrenceBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface TaskRowProps {
  task: Task;
  onToggle: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (task: Task) => void;
  tagsById?: Record<string, Tag>;
}

const PRIORITIES: Task['priority'][] = ['low', 'medium', 'high'];

function getPriorityColor(priority: Task['priority']): string {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-gray-400';
  }
}

function formatCreatedDate(date: Date): string {
  return format(date, 'MMM d, h:mm a');
}

export function TaskRow({ task, onToggle, onUpdate, onDelete, tagsById }: TaskRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isRecurringInstance = !!task.recurringParentId;

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const tags = task.tagIds
    ?.map((tagId) => tagsById?.[tagId])
    .filter((tag): tag is Tag => Boolean(tag)) ?? [];
  const hasTags = tags.length > 0;

  const handleSubtasksUpdate = (subtasks: Subtask[]) => {
    onUpdate({ ...task, subtasks });
  };

  return (
    <div
      className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
      style={{ contentVisibility: 'auto' }}
    >
      <div className="group flex items-center py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
        {/* Expand button for subtasks */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-5 h-5 flex-shrink-0 mr-1 ${
            hasSubtasks ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </Button>

        {/* Check button */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task)}
          className="w-5 h-5 rounded border-2 flex-shrink-0 mr-3 data-[state=checked]:bg-primary"
          aria-label={task.completed ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
        />

        {/* Task info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Priority dot - clickable to cycle */}
          <button
            onClick={() => {
              const nextIndex = (PRIORITIES.indexOf(task.priority) + 1) % 3;
              onUpdate({ ...task, priority: PRIORITIES[nextIndex] as Task['priority'] });
            }}
            className={`w-3 h-3 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)} hover:scale-125 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
            aria-label={`${task.priority} priority, click to change`}
          />

          {/* Title, Description and Tags */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-center gap-2 flex-wrap">
              <EditableText
                value={task.title}
                onSave={(value) => {
                  if (value) onUpdate({ ...task, title: value });
                }}
                className={`text-sm cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 ${
                  task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
                }`}
                inputClassName="text-sm flex-1 min-w-0 px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700"
                ariaLabel="Edit task title"
              />
              {/* Tags */}
              {hasTags && (
                <div className="flex items-center gap-1 flex-wrap">
                  {tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </div>
              )}
              {isRecurringInstance && task.recurrence && (
                <RecurrenceBadge pattern={task.recurrence} size="sm" />
              )}
            </div>

            {/* Description */}
            <EditableText
              value={task.description || ''}
              onSave={(value) => onUpdate({ ...task, description: value || undefined })}
              multiline
              placeholder="Add a note..."
              className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
              inputClassName="text-xs px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 dark:text-white dark:bg-gray-700"
              ariaLabel="Edit task description"
            />
          </div>
        </div>

      {/* Created date */}
      <div
        className="w-32 sm:w-40 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center flex-shrink-0 whitespace-nowrap"
        aria-label={`Created ${formatCreatedDate(task.createdAt)}`}
      >
        {formatCreatedDate(task.createdAt)}
      </div>

        {/* Action icons */}
        <div className="w-16 sm:w-24 flex items-center justify-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task)}
            className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Subtasks section */}
      {(isExpanded || !hasSubtasks) && (
        <div className={`px-4 pb-2 ${hasSubtasks ? 'block' : 'hidden group-hover:block'}`}>
          <SubtaskList
            subtasks={task.subtasks || []}
            onUpdate={handleSubtasksUpdate}
            disabled={task.completed}
          />
        </div>
      )}
    </div>
  );
}
