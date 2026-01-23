import { useState } from 'react';
import { TaskDateGroup, TaskInput, FilterTabs } from '@/components';
import type { Task, FilterType } from '@/types';

function App() {
  const [filter, setFilter] = useState<FilterType>('current');

  // Sample tasks for visual verification
  const sampleTasks: Task[] = [
    {
      id: 1,
      title: 'Complete project documentation',
      completed: false,
      priority: 'high',
      estimatedMinutes: 120,
      consumedMinutes: 45,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: 'Review pull requests',
      completed: true,
      priority: 'medium',
      estimatedMinutes: 60,
      consumedMinutes: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: 'Update dependencies',
      completed: false,
      priority: 'low',
      estimatedMinutes: 30,
      consumedMinutes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const handleToggle = (task: Task) => {
    console.log('Toggle task:', task.id);
  };

  const handleUpdate = (task: Task) => {
    console.log('Update task:', task.id);
  };

  const handleDelete = (task: Task) => {
    console.log('Delete task:', task.id);
  };

  const handleAddTask = (title: string, dueDate?: Date) => {
    console.log('Add task:', title, dueDate);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <FilterTabs
          filter={filter}
          onFilterChange={setFilter}
          counts={{ current: 8, overdue: 2, completed: 15 }}
        />
        <div className="mb-6">
          <TaskInput onAddTask={handleAddTask} />
        </div>
        <TaskDateGroup
          label="TODAY"
          count={4}
          tasks={sampleTasks}
          onToggle={handleToggle}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default App
