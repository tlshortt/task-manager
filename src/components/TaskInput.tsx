import { useRef, useImperativeHandle, forwardRef } from 'react';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import TagIcon from 'lucide-react/dist/esm/icons/tag';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import ListTodo from 'lucide-react/dist/esm/icons/list-todo';
import Repeat from 'lucide-react/dist/esm/icons/repeat';
import X from 'lucide-react/dist/esm/icons/x';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { Priority, Tag, Subtask, RecurrencePattern, Id } from '@/types';

// Note: Tag is still used for internal form state management
import { TagBadge, TAG_COLORS } from './TagBadge';
import { RecurrencePicker } from './RecurrencePicker';
import { useTaskForm } from '@/hooks/useTaskForm';

interface TaskInputProps {
  onAddTask: (title: string, dueDate?: Date, priority?: Priority, tagIds?: Id<'tags'>[], description?: string, subtasks?: Subtask[], recurrence?: RecurrencePattern) => void;
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
      showSubtasks,
      showRecurrencePicker,
      priority,
      tags,
      newTagName,
      subtasks,
      newSubtaskTitle,
      recurrence,
    },
    setters: {
      setTitle,
      setDescription,
      setShowDatePicker,
      setShowTagPicker,
      setShowDescription,
      setShowSubtasks,
      setShowRecurrencePicker,
      setPriority,
      setNewTagName,
      setNewSubtaskTitle,
    },
    actions: {
      handleSubmit,
      addTag,
      removeTag,
      addSubtask,
      removeSubtask,
      handleDateChange,
      handleRecurrenceChange,
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
            setShowSubtasks(false);
            setShowRecurrencePicker(false);
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
            setShowSubtasks(false);
            setShowRecurrencePicker(false);
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
            setShowSubtasks(false);
            setShowRecurrencePicker(false);
          }}
          aria-label={showDescription ? 'Hide note' : 'Add note'}
          aria-expanded={showDescription}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-2 min-h-[44px]"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Note</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowSubtasks(!showSubtasks);
            setShowDatePicker(false);
            setShowTagPicker(false);
            setShowDescription(false);
            setShowRecurrencePicker(false);
          }}
          aria-label={showSubtasks ? 'Hide subtasks' : 'Add subtasks'}
          aria-expanded={showSubtasks}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-2 min-h-[44px]"
        >
          <ListTodo className="w-4 h-4" />
          <span className="hidden sm:inline">Subtasks</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowRecurrencePicker(!showRecurrencePicker);
            setShowDatePicker(false);
            setShowTagPicker(false);
            setShowDescription(false);
            setShowSubtasks(false);
          }}
          aria-label={showRecurrencePicker ? 'Hide recurrence' : 'Set recurrence'}
          aria-expanded={showRecurrencePicker}
          className={`flex items-center gap-1.5 text-sm ${recurrence ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'} hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-2 min-h-[44px]`}
        >
          <Repeat className="w-4 h-4" />
          <span className="hidden sm:inline">Repeat</span>
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

      {showSubtasks && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSubtask();
                }
                handleEscape(e);
              }}
              placeholder="Add a subtask..."
              aria-label="New subtask title"
              className="flex-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addSubtask}
              disabled={!newSubtaskTitle.trim()}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Add subtask"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {subtasks.length > 0 && (
            <div className="mt-2 space-y-1">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 py-1 px-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
                >
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                    {subtask.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(subtask.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-opacity"
                    aria-label={`Remove subtask: ${subtask.title}`}
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">Press Enter or click + to add a subtask (max 10)</p>
        </div>
      )}

      {showRecurrencePicker && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <RecurrencePicker
            value={recurrence}
            onChange={handleRecurrenceChange}
            onClose={() => setShowRecurrencePicker(false)}
          />
        </div>
      )}

      {subtasks.length > 0 && !showSubtasks && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ListTodo className="w-4 h-4" />
            <span>{subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''} added</span>
          </div>
        </div>
      )}
    </div>
  );
})
