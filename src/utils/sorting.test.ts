import { describe, it, expect } from 'vitest'
import { sortTasks } from './sorting'
import type { Task } from '@/types'

/** Helper to build a minimal Task with overrides */
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    title: 'Untitled',
    completed: false,
    priority: 'medium',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    ...overrides,
  }
}

describe('sortTasks', () => {
  // --- Completed tasks always last ---

  describe('completed tasks sort to the bottom', () => {
    const tasks: Task[] = [
      makeTask({ title: 'Completed', completed: true, priority: 'high' }),
      makeTask({ title: 'Active', completed: false, priority: 'low' }),
    ]

    it('for priority sort', () => {
      const sorted = sortTasks(tasks, { field: 'priority', direction: 'desc' })
      expect(sorted.map(t => t.title)).toEqual(['Active', 'Completed'])
    })

    it('for title sort', () => {
      const sorted = sortTasks(tasks, { field: 'title', direction: 'asc' })
      expect(sorted.map(t => t.title)).toEqual(['Active', 'Completed'])
    })

    it('for createdAt sort', () => {
      const sorted = sortTasks(tasks, { field: 'createdAt', direction: 'asc' })
      expect(sorted.map(t => t.title)).toEqual(['Active', 'Completed'])
    })

    it('for dueDate sort', () => {
      const sorted = sortTasks(tasks, { field: 'dueDate', direction: 'asc' })
      expect(sorted.map(t => t.title)).toEqual(['Active', 'Completed'])
    })
  })

  // --- Priority sort ---

  describe('priority sort', () => {
    const tasks: Task[] = [
      makeTask({ title: 'Medium', priority: 'medium' }),
      makeTask({ title: 'High', priority: 'high' }),
      makeTask({ title: 'Low', priority: 'low' }),
    ]

    it('ascending: low → medium → high', () => {
      const sorted = sortTasks(tasks, { field: 'priority', direction: 'asc' })
      expect(sorted.map(t => t.title)).toEqual(['Low', 'Medium', 'High'])
    })

    it('descending: high → medium → low', () => {
      const sorted = sortTasks(tasks, { field: 'priority', direction: 'desc' })
      expect(sorted.map(t => t.title)).toEqual(['High', 'Medium', 'Low'])
    })
  })

  // --- Title sort ---

  describe('title sort', () => {
    const tasks: Task[] = [
      makeTask({ title: 'Charlie' }),
      makeTask({ title: 'alpha' }),
      makeTask({ title: 'Bravo' }),
    ]

    it('ascending: A → Z (case-insensitive)', () => {
      const sorted = sortTasks(tasks, { field: 'title', direction: 'asc' })
      expect(sorted.map(t => t.title)).toEqual(['alpha', 'Bravo', 'Charlie'])
    })

    it('descending: Z → A (case-insensitive)', () => {
      const sorted = sortTasks(tasks, { field: 'title', direction: 'desc' })
      expect(sorted.map(t => t.title)).toEqual(['Charlie', 'Bravo', 'alpha'])
    })
  })

  // --- Created date sort ---

  describe('createdAt sort', () => {
    const tasks: Task[] = [
      makeTask({ title: 'Middle', createdAt: new Date('2025-02-01') }),
      makeTask({ title: 'Oldest', createdAt: new Date('2025-01-01') }),
      makeTask({ title: 'Newest', createdAt: new Date('2025-03-01') }),
    ]

    it('ascending: oldest first', () => {
      const sorted = sortTasks(tasks, { field: 'createdAt', direction: 'asc' })
      expect(sorted.map(t => t.title)).toEqual(['Oldest', 'Middle', 'Newest'])
    })

    it('descending: newest first', () => {
      const sorted = sortTasks(tasks, { field: 'createdAt', direction: 'desc' })
      expect(sorted.map(t => t.title)).toEqual(['Newest', 'Middle', 'Oldest'])
    })
  })

  // --- Due date sort ---

  describe('dueDate sort', () => {
    const tasks: Task[] = [
      makeTask({ title: 'Later', dueDate: new Date('2025-06-01') }),
      makeTask({ title: 'Earlier', dueDate: new Date('2025-01-01') }),
      makeTask({ title: 'No Date' }), // no dueDate
      makeTask({ title: 'Mid', dueDate: new Date('2025-03-01') }),
    ]

    it('ascending: earlier dates first, no due date last', () => {
      const sorted = sortTasks(tasks, { field: 'dueDate', direction: 'asc' })
      expect(sorted.map(t => t.title)).toEqual(['Earlier', 'Mid', 'Later', 'No Date'])
    })

    it('descending: later dates first, no due date last', () => {
      const sorted = sortTasks(tasks, { field: 'dueDate', direction: 'desc' })
      expect(sorted.map(t => t.title)).toEqual(['Later', 'Mid', 'Earlier', 'No Date'])
    })

    it('tasks with no due date sort after tasks with dates', () => {
      const noDateTasks: Task[] = [
        makeTask({ title: 'No Date 1' }),
        makeTask({ title: 'Has Date', dueDate: new Date('2025-05-01') }),
        makeTask({ title: 'No Date 2' }),
      ]

      const sorted = sortTasks(noDateTasks, { field: 'dueDate', direction: 'asc' })
      expect(sorted.map(t => t.title)).toEqual(['Has Date', 'No Date 1', 'No Date 2'])
    })
  })

  // --- Does not mutate input ---

  it('returns a new array without mutating the input', () => {
    const tasks: Task[] = [
      makeTask({ title: 'B' }),
      makeTask({ title: 'A' }),
    ]
    const original = [...tasks]
    const sorted = sortTasks(tasks, { field: 'title', direction: 'asc' })

    expect(sorted).not.toBe(tasks)
    expect(tasks.map(t => t.title)).toEqual(original.map(t => t.title))
  })

  // --- Mixed completed + sort ---

  it('completed tasks sort to bottom, then active tasks are sorted', () => {
    const tasks: Task[] = [
      makeTask({ title: 'Active Low', completed: false, priority: 'low' }),
      makeTask({ title: 'Done High', completed: true, priority: 'high' }),
      makeTask({ title: 'Active High', completed: false, priority: 'high' }),
      makeTask({ title: 'Done Low', completed: true, priority: 'low' }),
    ]

    const sorted = sortTasks(tasks, { field: 'priority', direction: 'desc' })
    expect(sorted.map(t => t.title)).toEqual([
      'Active High',
      'Active Low',
      'Done High',
      'Done Low',
    ])
  })

  // --- Empty array ---

  it('returns empty array for empty input', () => {
    expect(sortTasks([], { field: 'title', direction: 'asc' })).toEqual([])
  })
})
