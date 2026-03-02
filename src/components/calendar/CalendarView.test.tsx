import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarView } from './CalendarView';
import type { Task } from '@/types';
import { testId } from '@/types';
import { format, startOfMonth, subMonths, addMonths } from 'date-fns';

// Mock the useRecurringTasks hook
vi.mock('@/hooks/useRecurringTasks', () => ({
  useRecurringTasks: () => ({
    deleteRecurringSeries: vi.fn(),
    updateRecurringSeries: vi.fn(),
    extendLookaheadWindow: vi.fn().mockResolvedValue(undefined),
  }),
}));

const now = new Date();
const currentYear = now.getFullYear();
const currentMonthIndex = now.getMonth();

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
    createTask({ id: testId('1'), title: 'Task 1', dueDate: new Date(currentYear, currentMonthIndex, 15) }),
    createTask({ id: testId('2'), title: 'Task 2', dueDate: new Date(currentYear, currentMonthIndex, 20) }),
  ];

  const expectedDay15Label = format(new Date(currentYear, currentMonthIndex, 15), 'EEEE, MMMM d, yyyy');

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

    const monthYear = format(startOfMonth(now), 'MMMM yyyy');
    expect(screen.getByText(monthYear)).toBeInTheDocument();
  });

  it('shows task in modal when clicking a day with tasks', async () => {
    const user = userEvent.setup();

    render(<CalendarView {...defaultProps} />);

    const day15 = screen.getAllByText('15')[0];
    await user.click(day15!);

    await screen.findByText(expectedDay15Label);

    const taskElements = screen.getAllByText('Task 1');
    expect(taskElements.length).toBeGreaterThan(0);
  });

  it('calls onToggle when task is toggled in modal', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<CalendarView {...defaultProps} onToggle={onToggle} />);

    const day15 = screen.getAllByText('15')[0];
    await user.click(day15!);

    await screen.findByText(expectedDay15Label);

    const toggleButtons = screen.getAllByRole('checkbox', { name: /Mark Task 1 complete/i });
    await user.click(toggleButtons[toggleButtons.length - 1]!);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: testId('1') }));
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();

    render(<CalendarView {...defaultProps} />);

    const day15 = screen.getAllByText('15')[0];
    await user.click(day15!);

    await screen.findByText(expectedDay15Label);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(screen.queryByText(expectedDay15Label)).not.toBeInTheDocument();
  });

  it('navigates to previous month', async () => {
    const user = userEvent.setup();

    render(<CalendarView {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Previous month' }));

    const prevMonthLabel = format(subMonths(startOfMonth(now), 1), 'MMMM yyyy');
    expect(screen.getByText(prevMonthLabel)).toBeInTheDocument();
  });

  it('navigates to next month', async () => {
    const user = userEvent.setup();

    render(<CalendarView {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    const nextMonthLabel = format(addMonths(startOfMonth(now), 1), 'MMMM yyyy');
    expect(screen.getByText(nextMonthLabel)).toBeInTheDocument();
  });

  it('jumps back to current month when Today button is clicked', async () => {
    const user = userEvent.setup();

    render(<CalendarView {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    const todayButton = screen.getByRole('button', { name: 'Today' });
    await user.click(todayButton);

    const currentMonthLabel = format(startOfMonth(now), 'MMMM yyyy');
    expect(screen.getByText(currentMonthLabel)).toBeInTheDocument();
  });

  it('disables Today button when already on current month', () => {
    render(<CalendarView {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled();
  });

  it('displays empty state in modal when day has no tasks', async () => {
    const user = userEvent.setup();

    render(<CalendarView {...defaultProps} tasks={[]} />);

    const day1 = screen.getAllByText('1')[0];
    await user.click(day1!);

    await screen.findByText(/No tasks for this day/i);
  });

  it('calls onDelete when task is deleted in modal', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<CalendarView {...defaultProps} onDelete={onDelete} />);

    const day15 = screen.getAllByText('15')[0];
    await user.click(day15!);

    await screen.findByText(expectedDay15Label);

    const deleteButtons = screen.getAllByRole('button', { name: /Delete Task 1/i });
    await user.click(deleteButtons[deleteButtons.length - 1]!);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: testId('1') }));
  });
});
