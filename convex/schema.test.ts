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

  it('should have tasks table definition', () => {
    const tasksTable = schema.tables.tasks
    expect(tasksTable).toBeDefined()
  })

  it('should have tags table definition', () => {
    const tagsTable = schema.tables.tags
    expect(tagsTable).toBeDefined()
  })
})
