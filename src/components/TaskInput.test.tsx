import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskInput } from './TaskInput';

describe('TaskInput', () => {
  it('calls onAddTask when plus button is clicked with valid title', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();

    render(<TaskInput onAddTask={onAddTask} />);

    const input = screen.getByLabelText('New task title');
    const plusButton = screen.getByRole('button', { name: 'Add task' });

    await user.type(input, 'New task');
    await user.click(plusButton);

    expect(onAddTask).toHaveBeenCalledWith('New task', undefined);
    expect(onAddTask).toHaveBeenCalledTimes(1);
  });

  it('disables plus button when input is empty', () => {
    const onAddTask = vi.fn();

    render(<TaskInput onAddTask={onAddTask} />);

    const plusButton = screen.getByRole('button', { name: 'Add task' });
    expect(plusButton).toBeDisabled();
  });

  it('enables plus button when input has text', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();

    render(<TaskInput onAddTask={onAddTask} />);

    const input = screen.getByLabelText('New task title');
    const plusButton = screen.getByRole('button', { name: 'Add task' });

    expect(plusButton).toBeDisabled();

    await user.type(input, 'Task title');

    expect(plusButton).toBeEnabled();
  });

  it('clears input after submitting via plus button', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();

    render(<TaskInput onAddTask={onAddTask} />);

    const input = screen.getByLabelText('New task title') as HTMLInputElement;
    const plusButton = screen.getByRole('button', { name: 'Add task' });

    await user.type(input, 'Task to add');
    await user.click(plusButton);

    expect(input.value).toBe('');
  });

  it('calls onAddTask with due date when date is set', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();

    render(<TaskInput onAddTask={onAddTask} />);

    const input = screen.getByLabelText('New task title');
    const dateButton = screen.getByRole('button', { name: 'Show deadline picker' });
    const plusButton = screen.getByRole('button', { name: 'Add task' });

    await user.type(input, 'Task with deadline');
    await user.click(dateButton);

    const dateInput = screen.getByLabelText('Task deadline');
    await user.type(dateInput, '2026-12-31');

    await user.click(plusButton);

    expect(onAddTask).toHaveBeenCalledTimes(1);
    const callArgs = onAddTask.mock.calls[0];
    expect(callArgs?.[0]).toBe('Task with deadline');
    expect(callArgs?.[1]).toBeInstanceOf(Date);
    expect(callArgs?.[1]?.toISOString().split('T')[0]).toBe('2026-12-31');
  });

  it('does not call onAddTask when plus button is clicked with empty input', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();

    render(<TaskInput onAddTask={onAddTask} />);

    const plusButton = screen.getByRole('button', { name: 'Add task' });

    // Button should be disabled, but try clicking anyway
    expect(plusButton).toBeDisabled();
    
    // Even if we force click, form submission should be prevented
    await user.click(plusButton);

    expect(onAddTask).not.toHaveBeenCalled();
  });

  it('trims whitespace from task title before submitting', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();

    render(<TaskInput onAddTask={onAddTask} />);

    const input = screen.getByLabelText('New task title');
    const plusButton = screen.getByRole('button', { name: 'Add task' });

    await user.type(input, '  Task with spaces  ');
    await user.click(plusButton);

    expect(onAddTask).toHaveBeenCalledWith('Task with spaces', undefined);
  });
});
