import { render, screen } from '@testing-library/react'
import App from './App'

// Mock Convex hooks
vi.mock('@/hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: [
      {
        id: 'task-1',
        title: 'Test task',
        completed: false,
        priority: 'medium',
        createdAt: new Date('2026-01-30T00:00:00.000Z'),
        updatedAt: new Date('2026-01-30T00:00:00.000Z'),
      },
    ],
    isLoading: false,
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleComplete: vi.fn(),
  }),
}));

vi.mock('@/hooks/useRecurringTasks', () => ({
  useRecurringTasks: () => ({
    deleteRecurringSeries: vi.fn(),
    updateRecurringSeries: vi.fn(),
    extendLookaheadWindow: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/hooks/useTags', () => ({
  useTags: () => ({
    tags: [],
    isLoading: false,
    createTag: vi.fn(),
    removeTag: vi.fn(),
  }),
}));

describe('App', () => {
  it('renders the MainLayout component', () => {
    render(<App />)
    expect(screen.getByRole('tablist', { name: 'Task filters' })).toBeInTheDocument()
  })
})
