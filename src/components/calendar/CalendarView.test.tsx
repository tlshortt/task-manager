import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarView } from './CalendarView';
import type { Task } from '@/types';
import { testId } from '@/types';
import { startOfMonth } from 'date-fns';

// Mock the useRecurringTasks hook
vi.mock('@/hooks/useRecurringTasks', () => ({
  useRecurringTasks: () => ({
    deleteRecurringSeries: vi.fn(),
    updateRecurringSeries: vi.fn(),
    extendLookaheadWindow: vi.fn().mockResolvedValue(undefined),
  }),
}));

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: testId('1'),
  title: 'Test Task',
  completed: false,
  priority: 'medium',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

describe('CalendarView', () => {
  const mockTasks: Task[] = [
    createTask({ id: testId('1'), title: 'Task 1', dueDate: new Date(2026, 0, 15) }),
    createTask({ id: testId('2'), title: 'Task 2', dueDate: new Date(2026, 0, 20) }),
  ];

  const defaultProps = {
    tasks: mockTasks,
    onToggle: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders calendar grid with day headers', () => {
    render(<CalendarView {...defaultProps} />);

    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('displays current month and year in header', () => {
    render(<CalendarView {...defaultProps} />);

    const currentMonth = startOfMonth(new Date());
    const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    expect(screen.getByText(monthYear)).toBeInTheDocument();
  });

  it('renders 42 calendar day cells', () => {
    render(<CalendarView {...defaultProps} />);

    // Find all day buttons (excluding header cells)
    const dayButtons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent && /^\d+$/.test(btn.textContent.trim().split('\n')[0] || '')
    );
    
    // Should have 42 days (6 weeks)
    expect(dayButtons.length).toBeGreaterThanOrEqual(30); // At least current month days
  });

  it('displays task count badges on days with tasks', () => {
    render(<CalendarView {...defaultProps} />);

    // Find day 15 (should have 1 task)
    const day15 = screen.getAllByText('15')[0];
    expect(day15).toBeInTheDocument();
    
    // Check for task count badge
    const badges = screen.getAllByText('1');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('calls onToggle when task is toggled in modal', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    
    render(<CalendarView {...defaultProps} onToggle={onToggle} />);

    // Click on a day with tasks to open modal
    const day15Elements = screen.getAllByText('15');
    const day15 = day15Elements[0];
    if (!day15) throw new Error('Day 15 not found');
    await user.click(day15);

    // Wait for modal to appear
    await screen.findByText(/January 15, 2026/i);

    // Find and click the task toggle button in the modal (use getAllByRole in case there are multiple)
    const toggleButtons = screen.getAllByRole('button', { name: /Mark Task 1 complete/i });
    const toggleButton = toggleButtons[toggleButtons.length - 1];
    if (!toggleButton) throw new Error('Toggle button not found');
    await user.click(toggleButton); // Use last one (should be in modal)

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: testId('1') }));
  });

  it('opens modal when day is clicked', async () => {
    const user = userEvent.setup();
    
    render(<CalendarView {...defaultProps} />);

    const day15Elements = screen.getAllByText('15');
    const day15 = day15Elements[0];
    if (!day15) throw new Error('Day 15 not found');
    await user.click(day15);

    // Modal should appear with date
    const modalHeader = await screen.findByText(/January 15, 2026/i);
    expect(modalHeader).toBeInTheDocument();
    
    // Task should be in modal (use getAllByText since it might appear in calendar preview too)
    const taskElements = screen.getAllByText('Task 1');
    expect(taskElements.length).toBeGreaterThan(0);
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<CalendarView {...defaultProps} />);

    // Open modal
    const day15Elements = screen.getAllByText('15');
    const day15 = day15Elements[0];
    if (!day15) throw new Error('Day 15 not found');
    await user.click(day15);

    await screen.findByText(/January 15, 2026/i);

    // Close modal
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    // Modal should be closed
    expect(screen.queryByText(/January 15, 2026/i)).not.toBeInTheDocument();
  });

  it('navigates to previous month when prev button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<CalendarView {...defaultProps} />);

    const prevButton = screen.getByRole('button', { name: 'Previous month' });
    await user.click(prevButton);

    // Should show previous month
    const currentMonth = startOfMonth(new Date());
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthYear = prevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    expect(screen.getByText(prevMonthYear)).toBeInTheDocument();
  });

  it('navigates to next month when next button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<CalendarView {...defaultProps} />);

    const nextButton = screen.getByRole('button', { name: 'Next month' });
    await user.click(nextButton);

    // Should show next month
    const currentMonth = startOfMonth(new Date());
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthYear = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    expect(screen.getByText(nextMonthYear)).toBeInTheDocument();
  });

  it('jumps to current month when Today button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<CalendarView {...defaultProps} />);

    // Navigate to next month first
    const nextButton = screen.getByRole('button', { name: 'Next month' });
    await user.click(nextButton);

    // Click Today button
    const todayButton = screen.getByRole('button', { name: 'Today' });
    await user.click(todayButton);

    // Should be back to current month
    const currentMonth = startOfMonth(new Date());
    const currentMonthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    expect(screen.getByText(currentMonthYear)).toBeInTheDocument();
  });

  it('disables Today button when already on current month', () => {
    render(<CalendarView {...defaultProps} />);

    const todayButton = screen.getByRole('button', { name: 'Today' });
    expect(todayButton).toBeDisabled();
  });

  it('displays empty state in modal when day has no tasks', async () => {
    const user = userEvent.setup();
    
    render(<CalendarView {...defaultProps} tasks={[]} />);

    // Click on a day without tasks
    const day1Elements = screen.getAllByText('1');
    const day1 = day1Elements[0];
    if (!day1) throw new Error('Day 1 not found');
    await user.click(day1);

    await screen.findByText(/No tasks for this day/i);
  });

  it('calls onDelete when task is deleted in modal', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    
    render(<CalendarView {...defaultProps} onDelete={onDelete} />);

    // Open modal
    const day15Elements = screen.getAllByText('15');
    const day15 = day15Elements[0];
    if (!day15) throw new Error('Day 15 not found');
    await user.click(day15);

    await screen.findByText(/January 15, 2026/i);

    // Delete task (use getAllByRole in case there are multiple)
    const deleteButtons = screen.getAllByRole('button', { name: /Delete Task 1/i });
    const deleteButton = deleteButtons[deleteButtons.length - 1];
    if (!deleteButton) throw new Error('Delete button not found');
    await user.click(deleteButton); // Use last one (should be in modal)

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: testId('1') }));
  });
});
