import { useRef, useImperativeHandle, forwardRef } from 'react';
import Plus from 'lucide-react/dist/esm/icons/plus';
import CalendarIcon from 'lucide-react/dist/esm/icons/calendar';
import TagIcon from 'lucide-react/dist/esm/icons/tag';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import ListTodo from 'lucide-react/dist/esm/icons/list-todo';
import Repeat from 'lucide-react/dist/esm/icons/repeat';
import X from 'lucide-react/dist/esm/icons/x';
import type { Priority, Subtask, RecurrencePattern, Id } from '@/types';
import { TagBadge, TAG_COLORS } from './TagBadge';
import { RecurrencePicker } from './RecurrencePicker';
import { useTaskForm } from '@/hooks/useTaskForm';
import { useTags } from '@/hooks/useTags';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';

interface TaskInputProps {
  onAddTask: (title: string, dueDate?: Date, priority?: Priority, tagIds?: Id<'tags'>[], description?: string, subtasks?: Subtask[], recurrence?: RecurrencePattern) => void;
}

export interface TaskInputHandle {
  focus: () => void;
}

export const TaskInput = forwardRef<TaskInputHandle, TaskInputProps>(function TaskInput({ onAddTask }, ref) {
  const { createTag } = useTags();
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
  } = useTaskForm({ onAddTask, onCreateTag: createTag });

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
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Add task"
          disabled={!title.trim()}
          className="flex-shrink-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
        >
          <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </Button>

        <Input
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
          className="flex-1 border-0 shadow-none focus-visible:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white dark:bg-transparent min-h-[44px] py-2"
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
              className={cn(
                'w-4 h-4 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1',
                p === 'low' ? 'bg-gray-400' : p === 'medium' ? 'bg-amber-500' : 'bg-red-500',
                priority === p ? 'ring-2 ring-offset-1 ring-purple-500 scale-110' : 'opacity-50 hover:opacity-75'
              )}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowTagPicker(!showTagPicker);
            setShowDatePicker(false);
            setShowDescription(false);
            setShowSubtasks(false);
            setShowRecurrencePicker(false);
          }}
          aria-label={showTagPicker ? 'Hide category picker' : 'Add categories'}
          aria-expanded={showTagPicker}
          className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 min-h-[44px]"
        >
          <TagIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Categories</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowDatePicker(!showDatePicker);
            setShowTagPicker(false);
            setShowDescription(false);
            setShowSubtasks(false);
            setShowRecurrencePicker(false);
          }}
          aria-label={showDatePicker ? 'Hide deadline picker' : 'Show deadline picker'}
          aria-expanded={showDatePicker}
          className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 min-h-[44px]"
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Deadline</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowDescription(!showDescription);
            setShowDatePicker(false);
            setShowTagPicker(false);
            setShowSubtasks(false);
            setShowRecurrencePicker(false);
          }}
          aria-label={showDescription ? 'Hide note' : 'Add note'}
          aria-expanded={showDescription}
          className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 min-h-[44px]"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Note</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowSubtasks(!showSubtasks);
            setShowDatePicker(false);
            setShowTagPicker(false);
            setShowDescription(false);
            setShowRecurrencePicker(false);
          }}
          aria-label={showSubtasks ? 'Hide subtasks' : 'Add subtasks'}
          aria-expanded={showSubtasks}
          className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 min-h-[44px]"
        >
          <ListTodo className="w-4 h-4" />
          <span className="hidden sm:inline">Subtasks</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowRecurrencePicker(!showRecurrencePicker);
            setShowDatePicker(false);
            setShowTagPicker(false);
            setShowDescription(false);
            setShowSubtasks(false);
          }}
          aria-label={showRecurrencePicker ? 'Hide recurrence' : 'Set recurrence'}
          aria-expanded={showRecurrencePicker}
          className={cn(
            'min-h-[44px]',
            recurrence
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
          )}
        >
          <Repeat className="w-4 h-4" />
          <span className="hidden sm:inline">Repeat</span>
        </Button>
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
            date={dueDate}
            onDateChange={(day) => handleDateChange(day ?? null)}
            placeholder="Select date"
          />
        </div>
      )}

      {showTagPicker && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newTagName.trim()) void addTag('blue');
                }
                handleEscape(e);
              }}
              placeholder="Category name..."
              className="w-auto text-sm"
            />
            <div className="flex gap-1">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => void addTag(color)}
                  disabled={!newTagName.trim()}
                  className={`w-6 h-6 rounded-full bg-${color}-500 hover:scale-110 transition-transform disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  aria-label={`Add ${color} tag`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Type a name and click a color to add a category</p>
        </div>
      )}

      {showDescription && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleEscape}
            placeholder="Add a note..."
            aria-label="Task description"
            rows={3}
            className="resize-none"
          />
        </div>
      )}

      {showSubtasks && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Input
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
              className="flex-1 text-sm"
            />
            <Button
              type="button"
              size="icon"
              onClick={addSubtask}
              disabled={!newSubtaskTitle.trim()}
              aria-label="Add subtask"
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubtask(subtask.id)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 hover:bg-red-100 dark:hover:bg-red-900/30 transition-opacity"
                    aria-label={`Remove subtask: ${subtask.title}`}
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </Button>
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
    </Card>
  );
})
