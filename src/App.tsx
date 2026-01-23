import { TaskDateGroup } from '@/components';
import type { Task } from '@/types';

function App() {
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
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
