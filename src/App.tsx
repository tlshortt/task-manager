import { useState } from 'react'
import type { Task, CreateTaskInput } from '@/types'
import { TaskList } from '@/components/TaskList'
import { TaskForm } from '@/components/TaskForm'

// Sample initial tasks for development
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Set up Ralph loop',
    description: 'Configure the autonomous AI coding loop',
    completed: true,
    createdAt: new Date('2026-01-20'),
  },
  {
    id: '2',
    title: 'Add priority feature',
    description: 'Implement task priorities (high/medium/low)',
    completed: false,
    createdAt: new Date('2026-01-21'),
  },
  {
    id: '3',
    title: 'Write documentation',
    description: 'Document the Ralph workflow',
    completed: false,
    createdAt: new Date('2026-01-22'),
  },
]

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const handleCreateTask = (input: CreateTaskInput) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      completed: false,
      createdAt: new Date(),
    }
    setTasks((prev) => [newTask, ...prev])
  }

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-gray-600 mt-1">
            Ralph Starter Kit - Autonomous AI Coding Demo
          </p>
        </header>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Add New Task
            </h2>
            <TaskForm onSubmit={handleCreateTask} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Tasks ({tasks.length})
            </h2>
            {/* TODO: PriorityFilter will be added here by Ralph (US-008) */}
            <TaskList
              tasks={tasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          </section>
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            Built with the{' '}
            <a
              href="https://github.com/snarktank/ralph"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ralph Loop
            </a>{' '}
            technique
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
