import { useState, useRef, lazy, Suspense, useCallback } from 'react';
import { AppHeader } from './AppHeader';
import { FilterTabs } from './FilterTabs';
import { SearchBar } from './SearchBar';
import { TaskInput } from './TaskInput';
import { TaskDateGroup } from './TaskDateGroup';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useTasks } from '@/hooks/useTasks';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { filterAndSearchTasks, getFilterCounts } from '@/utils/filters';
import { groupTasksByDate, formatDateLabel, sortDateGroups } from '@/utils/dateUtils';
import type { FilterType, Priority, Task, Tag } from '@/types';

const EmptyState = lazy(() => import('./EmptyState').then(module => ({ default: module.EmptyState })));
const KeyboardShortcutsModal = lazy(() => import('./KeyboardShortcutsModal').then(module => ({ default: module.KeyboardShortcutsModal })));

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

  const handleAddTask = useCallback(async (title: string, dueDate?: Date, priority: Priority = 'medium', tags?: Tag[], description?: string) => {
    await addTask({
      title,
      description,
      completed: false,
      priority,
      dueDate,
      subtasks: undefined,
      tags,
    });
  }, [addTask]);

  const handleToggle = useCallback(async (task: Task) => {
    if (task.id) {
      await toggleComplete(task.id);
    }
  }, [toggleComplete]);

  const handleUpdate = useCallback(async (task: Task) => {
    if (task.id) {
      await updateTask(task.id, task);
    }
  }, [updateTask]);

  const handleDelete = useCallback(async (task: Task) => {
    if (task.id) {
      await deleteTask(task.id);
    }
  }, [deleteTask]);

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
          <Suspense fallback={null}>
            <EmptyState filter={filter} searchQuery={debouncedSearchQuery} />
          </Suspense>
        ) : (
          <main>
            {sortedGroups.map(([dateKey, dateTasks]) => {
              let label: string;
              if (dateKey === 'no-date') {
                label = 'NO DUE DATE';
              } else if (dateKey === 'today') {
                label = 'TODAY';
              } else if (dateKey === 'tomorrow') {
                label = 'TOMORROW';
              } else {
                // Parse date string as local time (append T00:00:00 to avoid UTC parsing)
                const date = new Date(dateKey + 'T00:00:00');
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

      {showShortcuts && (
        <Suspense fallback={null}>
          <KeyboardShortcutsModal
            isOpen={showShortcuts}
            onClose={() => setShowShortcuts(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
