import { describe, it, expect } from 'vitest'
import schema from './schema'

describe('Convex Schema', () => {
  it('should export a valid schema object', () => {
    expect(schema).toBeDefined()
    expect(typeof schema).toBe('object')
  })

  it('should have the correct structure from defineSchema', () => {
    // The schema is created with defineSchema, so it should have these properties
    expect(schema).toHaveProperty('tables')
  })
})
