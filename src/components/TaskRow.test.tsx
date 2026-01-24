import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskRow } from './TaskRow';
import type { Task } from '@/types';

describe('TaskRow', () => {
  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    completed: false,
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders task title and information', () => {
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskRow
        task={mockTask}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <TaskRow
        task={mockTask}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    // Get the checkbox specifically (first button in the row)
    const checkbox = container.querySelector('button.w-5.h-5.rounded-md');
    if (checkbox) {
      await user.click(checkbox);
    }

    expect(onToggle).toHaveBeenCalledWith(mockTask);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskRow
        task={mockTask}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete Test Task' });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockTask);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('shows completed styling when task is completed', () => {
    const completedTask: Task = { ...mockTask, completed: true };
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <TaskRow
        task={completedTask}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const title = screen.getByText('Test Task');
    expect(title.className).toContain('line-through');
    expect(title.className).toContain('text-gray-400');

    const checkbox = container.querySelector('.bg-purple-600');
    expect(checkbox).toBeInTheDocument();
  });

  it('displays estimated and consumed time', () => {
    const taskWithTime: Task = {
      ...mockTask,
      estimatedMinutes: 90,
      consumedMinutes: 45,
    };
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskRow
        task={taskWithTime}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('1hr 30m')).toBeInTheDocument();
    expect(screen.getByText('45m')).toBeInTheDocument();
  });

  it('displays -- for missing time values', () => {
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <TaskRow
        task={mockTask}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const timeDisplays = container.querySelectorAll('.tabular-nums');
    expect(timeDisplays[0]).toHaveTextContent('--');
    expect(timeDisplays[1]).toHaveTextContent('--');
  });

  it('shows correct priority color', () => {
    const highPriorityTask: Task = { ...mockTask, priority: 'high' };
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <TaskRow
        task={highPriorityTask}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const priorityDot = container.querySelector('.bg-red-500');
    expect(priorityDot).toBeInTheDocument();
  });
});
