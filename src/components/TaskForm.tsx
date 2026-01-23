import { useState } from 'react'
import type { CreateTaskInput } from '@/types'

interface TaskFormProps {
  onSubmit: (input: CreateTaskInput) => void
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  // TODO: Ralph will add priority state here (US-006)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      // TODO: Ralph will add priority here (US-006)
    })

    // Reset form
    setTitle('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label
          htmlFor="task-title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="input"
          required
        />
      </div>

      <div>
        <label
          htmlFor="task-description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description (optional)
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={2}
          className="input resize-none"
        />
      </div>

      {/* TODO: Ralph will add PrioritySelect here (US-006) */}

      <button type="submit" className="btn btn-primary w-full">
        Add Task
      </button>
    </form>
  )
}
