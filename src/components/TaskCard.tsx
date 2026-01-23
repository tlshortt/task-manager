import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  onToggle: () => void
  onDelete: () => void
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  return (
    <div className="card flex items-start gap-3 group">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`font-medium ${
              task.completed ? 'text-gray-400 line-through' : 'text-gray-900'
            }`}
          >
            {task.title}
          </h3>
          
          {/* TODO: Ralph will add PriorityBadge here (US-005) */}
        </div>

        {task.description && (
          <p
            className={`mt-1 text-sm ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {task.description}
          </p>
        )}

        <p className="mt-2 text-xs text-gray-400">
          Created {task.createdAt.toLocaleDateString()}
        </p>
      </div>

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500"
        aria-label={`Delete "${task.title}"`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}
