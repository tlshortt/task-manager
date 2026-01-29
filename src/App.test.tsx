import { render, screen } from '@testing-library/react'
import App from './App'

// Mock Convex hooks
vi.mock('@/hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: [],
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

describe('App', () => {
  it('renders the MainLayout component', () => {
    render(<App />)
    expect(screen.getByRole('tablist', { name: 'Task filters' })).toBeInTheDocument()
  })
})
