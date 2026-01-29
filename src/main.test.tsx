import { describe, it, expect } from 'vitest'

describe('Convex Setup', () => {
  it('environment variable VITE_CONVEX_URL is defined', () => {
    // In the actual app, this comes from .env.local
    // In tests, Vite will use the actual env file or process.env
    expect(import.meta.env.VITE_CONVEX_URL).toBeDefined()
    expect(typeof import.meta.env.VITE_CONVEX_URL).toBe('string')
    expect(import.meta.env.VITE_CONVEX_URL).toMatch(/^https?:\/\//)
  })

  it('Convex package is installed', async () => {
    // Verify we can import from the convex package
    const { ConvexReactClient } = await import('convex/react')
    expect(ConvexReactClient).toBeDefined()
    expect(typeof ConvexReactClient).toBe('function')
  })
})
