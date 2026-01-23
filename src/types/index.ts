/**
 * Core types for the Task Manager application
 * 
 * NOTE: Ralph will extend these types as part of US-001
 * to add Priority support.
 */

/**
 * Represents a task in the application
 */
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: Date
  // TODO: Add 'priority' field (US-001)
}

/**
 * Props for creating a new task
 */
export interface CreateTaskInput {
  title: string
  description?: string
  // TODO: Add 'priority' field (US-001)
}
