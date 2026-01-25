import { useRef, useImperativeHandle, forwardRef } from 'react';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import TagIcon from 'lucide-react/dist/esm/icons/tag';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { Priority, Tag } from '@/types';
import { TagBadge, TAG_COLORS } from './TagBadge';
import { useTaskForm } from '@/hooks/useTaskForm';

interface TaskInputProps {
  onAddTask: (title: string, dueDate?: Date, priority?: Priority, tags?: Tag[], description?: string) => void;
}

export interface TaskInputHandle {
  focus: () => void;
}

export const TaskInput = forwardRef<TaskInputHandle, TaskInputProps>(function TaskInput({ onAddTask }, ref) {
  const {
    formState: {
      title,
      description,
      dueDate,
      showDatePicker,
      showTagPicker,
      showDescription,
      priority,
      tags,
      newTagName,
    },
    setters: {
      setTitle,
      setDescription,
      setShowDatePicker,
      setShowTagPicker,
      setShowDescription,
      setPriority,
      setNewTagName,
    },
    actions: {
      handleSubmit,
      addTag,
      removeTag,
      handleDateChange,
      handleEscape,
    }
  } = useTaskForm({ onAddTask });

  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
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
          ref={inputRef}
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
          onClick={() => {
            setShowTagPicker(!showTagPicker);
            setShowDatePicker(false);
            setShowDescription(false);
          }}
          aria-label={showTagPicker ? 'Hide tag picker' : 'Add tags'}
          aria-expanded={showTagPicker}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-2 min-h-[44px]"
        >
          <TagIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Tags</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowDatePicker(!showDatePicker);
            setShowTagPicker(false);
            setShowDescription(false);
          }}
          aria-label={showDatePicker ? 'Hide deadline picker' : 'Show deadline picker'}
          aria-expanded={showDatePicker}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-2 min-h-[44px]"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Deadline</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowDescription(!showDescription);
            setShowDatePicker(false);
            setShowTagPicker(false);
          }}
          aria-label={showDescription ? 'Hide note' : 'Add note'}
          aria-expanded={showDescription}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-2 min-h-[44px]"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Note</span>
        </button>
      </form>

      {/* Current tags display */}
      {tags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} onRemove={() => removeTag(tag.id)} />
          ))}
        </div>
      )}

      {showDatePicker && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <DatePicker
            selected={dueDate}
            onChange={handleDateChange}
            onKeyDown={handleEscape}
            dateFormat="MMM d, yyyy"
            placeholderText="Select date"
            calendarClassName="custom-calendar"
            aria-label="Task deadline"
            className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none min-h-[44px]"
          />
        </div>
      )}

      {showTagPicker && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newTagName.trim()) addTag('blue');
                }
                handleEscape(e);
              }}
              placeholder="Tag name..."
              className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
            />
            <div className="flex gap-1">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => addTag(color)}
                  disabled={!newTagName.trim()}
                  className={`w-6 h-6 rounded-full bg-${color}-500 hover:scale-110 transition-transform disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  aria-label={`Add ${color} tag`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Type a name and click a color to add a tag</p>
        </div>
      )}

      {showDescription && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleEscape}
            placeholder="Add a note..."
            aria-label="Task description"
            rows={3}
            className="w-full text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-none"
          />
        </div>
      )}
    </div>
  );
})
