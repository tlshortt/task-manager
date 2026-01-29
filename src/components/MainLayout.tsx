import { useState, useRef, lazy, Suspense, useCallback, useMemo } from 'react';
import { AppHeader } from './AppHeader';
import { FilterTabs } from './FilterTabs';
import { SearchBar } from './SearchBar';
import { TaskInput } from './TaskInput';
import { TaskDateGroup } from './TaskDateGroup';
import { RecurringTaskGroup } from './RecurringTaskGroup';
import { ViewModeToggle } from './ViewModeToggle';
import { CalendarView } from './calendar';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useTasks } from '@/hooks/useTasks';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { filterAndSearchTasks, getFilterCounts } from '@/utils/filters';
import { groupTasksByDate, formatDateLabel, sortDateGroups } from '@/utils/dateUtils';
import type { FilterType, Priority, Task, Tag, ViewMode, Subtask, RecurrencePattern } from '@/types';

const EmptyState = lazy(() => import('./EmptyState').then(module => ({ default: module.EmptyState })));
const KeyboardShortcutsModal = lazy(() => import('./KeyboardShortcutsModal').then(module => ({ default: module.KeyboardShortcutsModal })));

export function MainLayout() {
  const { isDark, toggle } = useDarkMode();
  const { tasks, isLoading, addTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const [filter, setFilter] = useState<FilterType>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
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

  // Get filtered tasks (excluding recurring parents)
  const filteredTasks = useMemo(
    () => {
      const filtered = tasks ? filterAndSearchTasks(tasks, filter, debouncedSearchQuery) : [];
      return filtered.filter(task => !task.isRecurringParent);
    },
    [tasks, filter, debouncedSearchQuery]
  );

  // Separate recurring instances from regular tasks
  const { regularTasks, recurringGroups } = useMemo(() => {
    const regular: Task[] = [];
    const recurringByParent = new Map<number, { frequency: string; tasks: Task[] }>();

    for (const task of filteredTasks) {
      if (task.recurringParentId) {
        const parentId = task.recurringParentId;
        const existing = recurringByParent.get(parentId);
        if (existing) {
          existing.tasks.push(task);
        } else {
          // Find the parent to get frequency, or use task's recurrence
          const parentTask = tasks?.find(t => t.id === parentId);
          const frequency = parentTask?.recurrence?.frequency || 'weekly';
          recurringByParent.set(parentId, { frequency, tasks: [task] });
        }
      } else {
        regular.push(task);
      }
    }

    // Convert to array of groups with labels
    const groups: { label: string; task: Task; count: number }[] = [];
    for (const [, { frequency, tasks: recurringTasks }] of recurringByParent) {
      if (recurringTasks.length > 0) {
        const label = frequency.charAt(0).toUpperCase() + frequency.slice(1);
        // Sort by due date, use the first (earliest) as representative
        const sorted = [...recurringTasks].sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        groups.push({ label, task: sorted[0] as Task, count: sorted.length });
      }
    }

    return { regularTasks: regular, recurringGroups: groups };
  }, [filteredTasks, tasks]);

  // Get filter counts
  const counts = tasks ? getFilterCounts(tasks) : { current: 0, overdue: 0, completed: 0 };

  // Group and sort regular tasks by date
  const groupedTasks = groupTasksByDate(regularTasks);
  const sortedGroups = sortDateGroups(groupedTasks);

  // Filter tasks with due dates for calendar view
  const calendarTasks = useMemo(
    () => filteredTasks.filter((task) => task.dueDate !== undefined),
    [filteredTasks]
  );

  const handleAddTask = useCallback(async (title: string, dueDate?: Date, priority: Priority = 'medium', tags?: Tag[], description?: string, subtasks?: Subtask[], recurrence?: RecurrencePattern) => {
    await addTask({
      title,
      description,
      completed: false,
      priority,
      dueDate,
      subtasks,
      tags,
      recurrence,
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

        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />

        <div className="mb-6">
          <TaskInput ref={taskInputRef} onAddTask={handleAddTask} />
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12" role="status" aria-live="polite">Loading tasks...</div>
        ) : viewMode === 'calendar' ? (
          <CalendarView
            tasks={calendarTasks}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ) : sortedGroups.length === 0 && recurringGroups.length === 0 ? (
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
            {recurringGroups.map((group) => (
              <RecurringTaskGroup
                key={`recurring-${group.task.recurringParentId}`}
                label={group.label}
                count={group.count}
                task={group.task}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
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
