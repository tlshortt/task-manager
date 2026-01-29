import { describe, it, expect } from 'vitest'
import schema from './schema'

describe('Convex Schema', () => {
  it('should export a valid schema object', () => {
    expect(schema).toBeDefined()
    expect(typeof schema).toBe('object')
  })

  it('should export default defineSchema result', () => {
    // The schema should have the tables property from defineSchema
    expect(schema).toHaveProperty('tables')
  })

  it('should define tasks and tags tables', () => {
    expect(schema.tables).toHaveProperty('tasks')
    expect(schema.tables).toHaveProperty('tags')
  })

  it('should have required indexes on tasks table', () => {
    const tasksTable = schema.tables.tasks

    // Check that the table has indexes array
    expect(tasksTable.indexes).toBeDefined()
    expect(Array.isArray(tasksTable.indexes)).toBe(true)

    // Convex requires 4 indexes on tasks table
    expect(tasksTable.indexes.length).toBe(4)
  })

  it('should have required index on tags table', () => {
    const tagsTable = schema.tables.tags

    // Check that the table has indexes array
    expect(tagsTable.indexes).toBeDefined()
    expect(Array.isArray(tagsTable.indexes)).toBe(true)

    // Convex requires 1 index on tags table
    expect(tagsTable.indexes.length).toBe(1)
  })
})
