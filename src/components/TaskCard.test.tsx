import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'
import type { Task } from '@/types'

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  completed: false,
  createdAt: new Date('2024-01-15'),
}

describe('TaskCard', () => {
  it('renders task title and description', () => {
    render(<TaskCard task={mockTask} onToggle={() => {}} onDelete={() => {}} />)
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('calls onToggle when checkbox clicked', async () => {
    const onToggle = vi.fn()
    render(<TaskCard task={mockTask} onToggle={onToggle} onDelete={() => {}} />)
    
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('applies line-through style when completed', () => {
    const completedTask = { ...mockTask, completed: true }
    render(<TaskCard task={completedTask} onToggle={() => {}} onDelete={() => {}} />)
    
    expect(screen.getByText('Test Task')).toHaveClass('line-through')
  })
})
