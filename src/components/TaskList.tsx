import type { Task } from '@/types'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500">No tasks yet. Add one above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* TODO: Ralph will add PriorityFilter here (US-008) */}
      {/* TODO: Ralph will add sorting by priority (US-008) */}
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={() => onToggle(task.id)}
          onDelete={() => onDelete(task.id)}
        />
      ))}
    </div>
  )
}
