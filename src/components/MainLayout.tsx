import { useState } from 'react';
import { AppHeader } from './AppHeader';
import { FilterTabs } from './FilterTabs';
import { TaskInput } from './TaskInput';
import { TaskDateGroup } from './TaskDateGroup';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useTasks } from '@/hooks/useTasks';
import { filterTasks, getFilterCounts } from '@/utils/filters';
import { groupTasksByDate, formatDateLabel } from '@/utils/dateUtils';
import type { FilterType, Task } from '@/types';

export function MainLayout() {
  const { isDark, toggle } = useDarkMode();
  const { tasks, isLoading, addTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const [filter, setFilter] = useState<FilterType>('current');

  // Get filtered tasks
  const filteredTasks = tasks ? filterTasks(tasks, filter) : [];

  // Get filter counts
  const counts = tasks ? getFilterCounts(tasks) : { current: 0, overdue: 0, completed: 0 };

  // Group filtered tasks by date
  const groupedTasks = groupTasksByDate(filteredTasks);

  // Sort groups: today, tomorrow, then chronologically
  const sortedGroups = Array.from(groupedTasks.entries()).sort(([keyA], [keyB]) => {
    if (keyA === 'today') return -1;
    if (keyB === 'today') return 1;
    if (keyA === 'tomorrow') return -1;
    if (keyB === 'tomorrow') return 1;
    return keyA.localeCompare(keyB);
  });

  const handleAddTask = async (title: string, dueDate?: Date) => {
    await addTask({
      title,
      description: undefined,
      completed: false,
      priority: 'medium',
      dueDate,
      estimatedMinutes: undefined,
      consumedMinutes: undefined,
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
      <div className="max-w-4xl mx-auto px-6">
        <AppHeader isDark={isDark} onToggleDarkMode={toggle} />

        <FilterTabs
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
        />

        <div className="mb-6">
          <TaskInput onAddTask={handleAddTask} />
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500 py-12">Loading tasks...</div>
        ) : sortedGroups.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No tasks to display</div>
        ) : (
          sortedGroups.map(([dateKey, dateTasks]) => {
            const date = dateKey === 'today'
              ? new Date()
              : dateKey === 'tomorrow'
              ? new Date(Date.now() + 86400000)
              : new Date(dateKey);

            const label = formatDateLabel(date);

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
          })
        )}
      </div>
    </div>
  );
}
