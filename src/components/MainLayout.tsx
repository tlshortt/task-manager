import { useState, useRef } from 'react';
import { AppHeader } from './AppHeader';
import { FilterTabs } from './FilterTabs';
import { SearchBar } from './SearchBar';
import { TaskInput } from './TaskInput';
import { TaskDateGroup } from './TaskDateGroup';
import { EmptyState } from './EmptyState';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useTasks } from '@/hooks/useTasks';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { filterAndSearchTasks, getFilterCounts } from '@/utils/filters';
import { groupTasksByDate, formatDateLabel, sortDateGroups } from '@/utils/dateUtils';
import type { FilterType, Priority, Task, Tag } from '@/types';

export function MainLayout() {
  const { isDark, toggle } = useDarkMode();
  const { tasks, isLoading, addTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const [filter, setFilter] = useState<FilterType>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const taskInputRef = useRef<{ focus: () => void }>(null);

  // Debounce search query for performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useKeyboardShortcuts({
    onNewTask: () => taskInputRef.current?.focus(),
    onToggleHelp: () => setShowShortcuts((s) => !s),
    onToggleDarkMode: toggle,
    onEscape: () => setShowShortcuts(false),
    onSearch: () => searchInputRef.current?.focus(),
  });

  // Get filtered tasks
  const filteredTasks = tasks ? filterAndSearchTasks(tasks, filter, debouncedSearchQuery) : [];

  // Get filter counts
  const counts = tasks ? getFilterCounts(tasks) : { current: 0, overdue: 0, completed: 0 };

  // Group and sort tasks by date
  const groupedTasks = groupTasksByDate(filteredTasks);
  const sortedGroups = sortDateGroups(groupedTasks);

  const handleAddTask = async (title: string, dueDate?: Date, priority: Priority = 'medium', tags?: Tag[]) => {
    await addTask({
      title,
      description: undefined,
      completed: false,
      priority,
      dueDate,
      estimatedMinutes: undefined,
      consumedMinutes: undefined,
      subtasks: undefined,
      tags,
    });
  };

  const handleToggle = async (task: Task) => {
    if (task.id) {
      await toggleComplete(task.id);
    }
  };

  const handleUpdate = async (task: Task) => {
    if (task.id) {
      await updateTask(task.id, task);
    }
  };

  const handleDelete = async (task: Task) => {
    if (task.id) {
      await deleteTask(task.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <AppHeader isDark={isDark} onToggleDarkMode={toggle} />

        <SearchBar
          ref={searchInputRef}
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <FilterTabs
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
        />

        <div className="mb-6">
          <TaskInput ref={taskInputRef} onAddTask={handleAddTask} />
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12" role="status" aria-live="polite">Loading tasks...</div>
        ) : sortedGroups.length === 0 ? (
          <EmptyState filter={filter} searchQuery={debouncedSearchQuery} />
        ) : (
          <main>
            {sortedGroups.map(([dateKey, dateTasks]) => {
              let label: string;
              if (dateKey === 'no-date') {
                label = 'NO DUE DATE';
              } else {
                const date = dateKey === 'today'
                  ? new Date()
                  : dateKey === 'tomorrow'
                  ? new Date(Date.now() + 86400000)
                  : new Date(dateKey);
                label = formatDateLabel(date);
              }

              return (
                <TaskDateGroup
                  key={dateKey}
                  label={label}
                  count={dateTasks.length}
                  tasks={dateTasks}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              );
            })}
          </main>
        )}
      </div>

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
