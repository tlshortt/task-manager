import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { TaskDateGroup, TaskInput, FilterTabs, PriorityBadge, TimeDisplay, ProgressBar } from '@/components';
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
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
        }}
      />
      <div className="max-w-4xl mx-auto">
        <FilterTabs
          filter={filter}
          onFilterChange={setFilter}
          counts={{ current: 8, overdue: 2, completed: 15 }}
        />
        <div className="mb-6">
          <TaskInput onAddTask={handleAddTask} />
        </div>
        <div className="mb-6 bg-white rounded-xl shadow-card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Priority Badge Test</h3>
          <div className="flex gap-4">
            <div className="flex items-center">
              <PriorityBadge priority="high" />
              <span className="text-sm">High</span>
            </div>
            <div className="flex items-center">
              <PriorityBadge priority="medium" />
              <span className="text-sm">Medium</span>
            </div>
            <div className="flex items-center">
              <PriorityBadge priority="low" />
              <span className="text-sm">Low</span>
            </div>
          </div>
        </div>
        <div className="mb-6 bg-white rounded-xl shadow-card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">TimeDisplay Test</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-32">90 minutes:</span>
              <TimeDisplay minutes={90} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-32">45 minutes:</span>
              <TimeDisplay minutes={45} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-32">120 minutes:</span>
              <TimeDisplay minutes={120} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-32">0 minutes:</span>
              <TimeDisplay minutes={0} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-32">Consumed variant:</span>
              <TimeDisplay minutes={90} variant="consumed" />
            </div>
          </div>
        </div>
        <div className="mb-6 bg-white rounded-xl shadow-card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">ProgressBar Test</h3>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Normal (30/90 min)</span>
                <span className="text-sm text-gray-600">33%</span>
              </div>
              <ProgressBar consumed={30} estimated={90} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Half (60/120 min)</span>
                <span className="text-sm text-gray-600">50%</span>
              </div>
              <ProgressBar consumed={60} estimated={120} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Nearly done (80/90 min)</span>
                <span className="text-sm text-gray-600">89%</span>
              </div>
              <ProgressBar consumed={80} estimated={90} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Over budget (100/60 min)</span>
                <span className="text-sm text-red-600">Over!</span>
              </div>
              <ProgressBar consumed={100} estimated={60} />
            </div>
          </div>
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
