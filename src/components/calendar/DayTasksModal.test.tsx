import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DayTasksModal } from './DayTasksModal';
import type { Task } from '@/types';
import { testId } from '@/types';

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: testId('1'),
  title: 'Test Task',
  completed: false,
  priority: 'medium',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

describe('DayTasksModal', () => {
  const mockDate = new Date(2026, 0, 15); // January 15, 2026
  const mockTasks: Task[] = [
    createTask({ id: testId('1'), title: 'Task 1', dueDate: mockDate }),
    createTask({ id: testId('2'), title: 'Task 2', dueDate: mockDate }),
  ];

  const defaultProps = {
    isOpen: true,
    date: mockDate,
    tasks: mockTasks,
    onClose: vi.fn(),
    onToggle: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<DayTasksModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText(/January 15, 2026/i)).not.toBeInTheDocument();
  });

  it('displays formatted date in header', () => {
    render(<DayTasksModal {...defaultProps} />);
    
    expect(screen.getByText(/January 15, 2026/i)).toBeInTheDocument();
  });

  it('displays all tasks for the date', () => {
    render(<DayTasksModal {...defaultProps} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('displays empty state when no tasks', () => {
    render(<DayTasksModal {...defaultProps} tasks={[]} />);
    
    expect(screen.getByText('No tasks for this day')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<DayTasksModal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<DayTasksModal {...defaultProps} onClose={onClose} />);
    
    // Click on backdrop (the outer div)
    const backdrop = screen.getByText(/January 15, 2026/i).closest('.fixed');
    if (backdrop) {
      await user.click(backdrop);
    }
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<DayTasksModal {...defaultProps} onClose={onClose} />);
    
    // Click on modal content (not backdrop)
    const modalContent = screen.getByText('Task 1');
    await user.click(modalContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<DayTasksModal {...defaultProps} onClose={onClose} />);
    
    await user.keyboard('{Escape}');
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onToggle when task toggle button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    
    render(<DayTasksModal {...defaultProps} onToggle={onToggle} />);
    
    const toggleButton = screen.getByRole('button', { name: /Mark Task 1 complete/i });
    await user.click(toggleButton);
    
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('calls onDelete when task delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    
    render(<DayTasksModal {...defaultProps} onDelete={onDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /Delete Task 1/i });
    await user.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('calls onUpdate when task is updated', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    
    render(<DayTasksModal {...defaultProps} onUpdate={onUpdate} />);
    
    // Click on task title to edit (EditableText component)
    const taskTitle = screen.getByText('Task 1');
    await user.click(taskTitle);
    
    // Type new title
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Updated Task');
    
    // Save with Enter key
    await user.keyboard('{Enter}');
    
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ 
      id: testId('1'), 
      title: 'Updated Task' 
    }));
  });

  it('renders tasks using TaskRow component', () => {
    render(<DayTasksModal {...defaultProps} />);
    
    // TaskRow should render task titles
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('handles different date formats correctly', () => {
    const differentDate = new Date(2026, 11, 25); // December 25, 2026
    
    render(<DayTasksModal {...defaultProps} date={differentDate} />);
    
    expect(screen.getByText(/December 25, 2026/i)).toBeInTheDocument();
  });
});
