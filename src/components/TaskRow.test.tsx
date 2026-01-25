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

  it('calls onToggle when check button is clicked', async () => {
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

    // Get the check button by aria-label
    const checkButton = screen.getByRole('button', { name: 'Mark Test Task complete' });
    await user.click(checkButton);

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

    render(
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

    const checkButton = screen.getByRole('button', { name: 'Mark Test Task incomplete' });
    expect(checkButton.className).toContain('bg-purple-600');
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

  it('clicking title enters edit mode', async () => {
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

    const title = screen.getByText('Test Task');
    await user.click(title);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Test Task');
    expect(input).toHaveFocus();
  });

  it('Enter key saves and exits edit mode', async () => {
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

    const title = screen.getByText('Test Task');
    await user.click(title);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.keyboard('Updated Task');
    await user.keyboard('{Enter}');

    expect(onUpdate).toHaveBeenCalledWith({ ...mockTask, title: 'Updated Task' });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('Escape key cancels edit', async () => {
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

    const title = screen.getByText('Test Task');
    await user.click(title);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.keyboard('Should Not Save');
    await user.keyboard('{Escape}');

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('blur cancels edit', async () => {
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

    const title = screen.getByText('Test Task');
    await user.click(title);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.keyboard('Should Not Save');
    await user.keyboard('{Tab}');

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  describe('priority cycling', () => {
    it('cycles from low to medium when priority dot is clicked', async () => {
      const user = userEvent.setup();
      const lowTask: Task = { ...mockTask, priority: 'low' };
      const onUpdate = vi.fn();

      render(
        <TaskRow
          task={lowTask}
          onToggle={vi.fn()}
          onUpdate={onUpdate}
          onDelete={vi.fn()}
        />
      );

      const priorityButton = screen.getByRole('button', { name: 'low priority, click to change' });
      await user.click(priorityButton);

      expect(onUpdate).toHaveBeenCalledWith({ ...lowTask, priority: 'medium' });
    });

    it('cycles from medium to high when priority dot is clicked', async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();

      render(
        <TaskRow
          task={mockTask}
          onToggle={vi.fn()}
          onUpdate={onUpdate}
          onDelete={vi.fn()}
        />
      );

      const priorityButton = screen.getByRole('button', { name: 'medium priority, click to change' });
      await user.click(priorityButton);

      expect(onUpdate).toHaveBeenCalledWith({ ...mockTask, priority: 'high' });
    });

    it('cycles from high to low when priority dot is clicked', async () => {
      const user = userEvent.setup();
      const highTask: Task = { ...mockTask, priority: 'high' };
      const onUpdate = vi.fn();

      render(
        <TaskRow
          task={highTask}
          onToggle={vi.fn()}
          onUpdate={onUpdate}
          onDelete={vi.fn()}
        />
      );

      const priorityButton = screen.getByRole('button', { name: 'high priority, click to change' });
      await user.click(priorityButton);

      expect(onUpdate).toHaveBeenCalledWith({ ...highTask, priority: 'low' });
    });
  });
});
