import { useState } from 'react';
import type { Task, Subtask } from '@/types';
import Check from 'lucide-react/dist/esm/icons/check';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { format } from 'date-fns';
import { TagBadge } from './TagBadge';
import { SubtaskList } from './SubtaskList';
import { EditableText } from './EditableText';

interface TaskRowProps {
  task: Task;
  onToggle: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (task: Task) => void;
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

export function TaskRow({ task, onToggle, onUpdate, onDelete }: TaskRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const hasTags = task.tags && task.tags.length > 0;

  const handleSubtasksUpdate = (subtasks: Subtask[]) => {
    onUpdate({ ...task, subtasks });
  };

  const handleRemoveTag = (tagId: string) => {
    const updatedTags = (task.tags || []).filter((t) => t.id !== tagId);
    onUpdate({ ...task, tags: updatedTags });
  };

  return (
    <div 
      className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
      style={{ contentVisibility: 'auto' }}
    >
      <div className="group flex items-center py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
        {/* Expand button for subtasks */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-5 h-5 flex items-center justify-center flex-shrink-0 mr-1 transition-opacity ${
            hasSubtasks ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Check button */}
        <button
          onClick={() => onToggle(task)}
          className={`w-5 h-5 rounded border-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center flex-shrink-0 mr-3 ${
            task.completed
              ? 'bg-purple-600 border-purple-600 dark:bg-purple-500 dark:border-purple-500'
              : 'border-gray-300 dark:border-gray-500 hover:border-purple-400 dark:hover:border-purple-400'
          }`}
          aria-label={task.completed ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
        >
          {task.completed && <Check className="w-3 h-3 text-white" />}
        </button>

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
                  {task.tags!.map((tag) => (
                    <TagBadge
                      key={tag.id}
                      tag={tag}
                      onRemove={() => handleRemoveTag(tag.id)}
                    />
                  ))}
                </div>
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
          <button
            onClick={() => onDelete(task)}
            className="p-2 min-w-[44px] min-h-[44px] hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center"
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </button>
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
