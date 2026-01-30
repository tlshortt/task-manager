import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskInput } from './TaskInput';

vi.mock('@/hooks/useTags', () => ({
  useTags: () => ({
    tags: [],
    isLoading: false,
    createTag: vi.fn().mockResolvedValue('tag-1'),
    removeTag: vi.fn(),
  }),
}));

describe('TaskInput', () => {
  it('calls onAddTask when plus button is clicked with valid title', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();

    render(<TaskInput onAddTask={onAddTask} />);

    const input = screen.getByLabelText('New task title');
    const plusButton = screen.getByRole('button', { name: 'Add task' });

    await user.type(input, 'New task');
    await user.click(plusButton);

    expect(onAddTask).toHaveBeenCalledWith('New task', undefined, 'medium', undefined, undefined, undefined, undefined);
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

    // react-datepicker uses formatted date input (MMM d, yyyy format)
    const dateInput = screen.getByLabelText('Task deadline');
    await user.type(dateInput, 'Dec 31, 2026');

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

    expect(onAddTask).toHaveBeenCalledWith('Task with spaces', undefined, 'medium', undefined, undefined, undefined, undefined);
  });

  describe('priority picker', () => {
    it('renders three priority options', () => {
      render(<TaskInput onAddTask={vi.fn()} />);

      const priorityGroup = screen.getByRole('radiogroup', { name: 'Task priority' });
      expect(priorityGroup).toBeInTheDocument();

      expect(screen.getByRole('radio', { name: 'low priority' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'medium priority' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'high priority' })).toBeInTheDocument();
    });

    it('defaults to medium priority selected', () => {
      render(<TaskInput onAddTask={vi.fn()} />);

      const mediumButton = screen.getByRole('radio', { name: 'medium priority' });
      expect(mediumButton).toHaveAttribute('aria-checked', 'true');
    });

    it('submits with high priority when selected', async () => {
      const user = userEvent.setup();
      const onAddTask = vi.fn();

      render(<TaskInput onAddTask={onAddTask} />);

      const input = screen.getByLabelText('New task title');
      const highPriority = screen.getByRole('radio', { name: 'high priority' });
      const plusButton = screen.getByRole('button', { name: 'Add task' });

      await user.click(highPriority);
      await user.type(input, 'High priority task');
      await user.click(plusButton);

      expect(onAddTask).toHaveBeenCalledWith('High priority task', undefined, 'high', undefined, undefined, undefined, undefined);
    });

    it('submits with low priority when selected', async () => {
      const user = userEvent.setup();
      const onAddTask = vi.fn();

      render(<TaskInput onAddTask={onAddTask} />);

      const input = screen.getByLabelText('New task title');
      const lowPriority = screen.getByRole('radio', { name: 'low priority' });
      const plusButton = screen.getByRole('button', { name: 'Add task' });

      await user.click(lowPriority);
      await user.type(input, 'Low priority task');
      await user.click(plusButton);

      expect(onAddTask).toHaveBeenCalledWith('Low priority task', undefined, 'low', undefined, undefined, undefined, undefined);
    });

    it('resets priority to medium after submit', async () => {
      const user = userEvent.setup();
      const onAddTask = vi.fn();

      render(<TaskInput onAddTask={onAddTask} />);

      const input = screen.getByLabelText('New task title');
      const highPriority = screen.getByRole('radio', { name: 'high priority' });
      const mediumPriority = screen.getByRole('radio', { name: 'medium priority' });
      const plusButton = screen.getByRole('button', { name: 'Add task' });

      await user.click(highPriority);
      await user.type(input, 'Task');
      await user.click(plusButton);

      // After submit, medium should be selected again
      expect(mediumPriority).toHaveAttribute('aria-checked', 'true');
      expect(highPriority).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('description input', () => {
    it('hides description textarea by default', () => {
      render(<TaskInput onAddTask={vi.fn()} />);

      expect(screen.queryByLabelText('Task description')).not.toBeInTheDocument();
    });

    it('shows description textarea when Note button is clicked', async () => {
      const user = userEvent.setup();
      render(<TaskInput onAddTask={vi.fn()} />);

      const noteButton = screen.getByRole('button', { name: 'Add note' });
      await user.click(noteButton);

      const descriptionTextarea = screen.getByLabelText('Task description');
      expect(descriptionTextarea).toBeInTheDocument();
      expect(noteButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('hides description textarea when Note button is clicked twice', async () => {
      const user = userEvent.setup();
      render(<TaskInput onAddTask={vi.fn()} />);

      const noteButton = screen.getByRole('button', { name: 'Add note' });
      await user.click(noteButton);
      await user.click(noteButton);

      expect(screen.queryByLabelText('Task description')).not.toBeInTheDocument();
      expect(noteButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('submits with description when provided', async () => {
      const user = userEvent.setup();
      const onAddTask = vi.fn();

      render(<TaskInput onAddTask={onAddTask} />);

      const input = screen.getByLabelText('New task title');
      const noteButton = screen.getByRole('button', { name: 'Add note' });
      const plusButton = screen.getByRole('button', { name: 'Add task' });

      await user.type(input, 'Task with description');
      await user.click(noteButton);

      const descriptionTextarea = screen.getByLabelText('Task description');
      await user.type(descriptionTextarea, 'This is a note');
      await user.click(plusButton);

      expect(onAddTask).toHaveBeenCalledWith('Task with description', undefined, 'medium', undefined, 'This is a note', undefined, undefined);
    });

    it('submits with undefined description when textarea is empty', async () => {
      const user = userEvent.setup();
      const onAddTask = vi.fn();

      render(<TaskInput onAddTask={onAddTask} />);

      const input = screen.getByLabelText('New task title');
      const noteButton = screen.getByRole('button', { name: 'Add note' });
      const plusButton = screen.getByRole('button', { name: 'Add task' });

      await user.type(input, 'Task without description');
      await user.click(noteButton);
      await user.click(plusButton);

      expect(onAddTask).toHaveBeenCalledWith('Task without description', undefined, 'medium', undefined, undefined, undefined, undefined);
    });

    it('trims whitespace from description', async () => {
      const user = userEvent.setup();
      const onAddTask = vi.fn();

      render(<TaskInput onAddTask={onAddTask} />);

      const input = screen.getByLabelText('New task title');
      const noteButton = screen.getByRole('button', { name: 'Add note' });
      const plusButton = screen.getByRole('button', { name: 'Add task' });

      await user.type(input, 'Task');
      await user.click(noteButton);

      const descriptionTextarea = screen.getByLabelText('Task description');
      await user.type(descriptionTextarea, '  Note with spaces  ');
      await user.click(plusButton);

      expect(onAddTask).toHaveBeenCalledWith('Task', undefined, 'medium', undefined, 'Note with spaces', undefined, undefined);
    });

    it('clears description after submit', async () => {
      const user = userEvent.setup();
      const onAddTask = vi.fn();

      render(<TaskInput onAddTask={onAddTask} />);

      const input = screen.getByLabelText('New task title');
      const noteButton = screen.getByRole('button', { name: 'Add note' });
      const plusButton = screen.getByRole('button', { name: 'Add task' });

      await user.type(input, 'Task');
      await user.click(noteButton);

      const descriptionTextarea = screen.getByLabelText('Task description');
      await user.type(descriptionTextarea, 'Description');
      await user.click(plusButton);

      expect(screen.queryByLabelText('Task description')).not.toBeInTheDocument();
      expect(noteButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('subtasks', () => {
    it('hides subtask input by default', () => {
      render(<TaskInput onAddTask={vi.fn()} />);

      expect(screen.queryByLabelText('New subtask title')).not.toBeInTheDocument();
    });

    it('shows subtask input when Subtasks button is clicked', async () => {
      const user = userEvent.setup();
      render(<TaskInput onAddTask={vi.fn()} />);

      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      await user.click(subtasksButton);

      const subtaskInput = screen.getByLabelText('New subtask title');
      expect(subtaskInput).toBeInTheDocument();
      expect(subtasksButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('hides subtask input when Subtasks button is clicked twice', async () => {
      const user = userEvent.setup();
      render(<TaskInput onAddTask={vi.fn()} />);

      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      await user.click(subtasksButton);
      await user.click(subtasksButton);

      expect(screen.queryByLabelText('New subtask title')).not.toBeInTheDocument();
      expect(subtasksButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('adds a subtask when pressing Enter in subtask input', async () => {
      const user = userEvent.setup();
      render(<TaskInput onAddTask={vi.fn()} />);

      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      await user.click(subtasksButton);

      const subtaskInput = screen.getByLabelText('New subtask title');
      await user.type(subtaskInput, 'My subtask{enter}');

      expect(screen.getByText('My subtask')).toBeInTheDocument();
    });

    it('adds a subtask when clicking the add button', async () => {
      const user = userEvent.setup();
      render(<TaskInput onAddTask={vi.fn()} />);

      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      await user.click(subtasksButton);

      const subtaskInput = screen.getByLabelText('New subtask title');
      await user.type(subtaskInput, 'Another subtask');

      const addSubtaskButton = screen.getByRole('button', { name: 'Add subtask' });
      await user.click(addSubtaskButton);

      expect(screen.getByText('Another subtask')).toBeInTheDocument();
    });

    it('clears subtask input after adding a subtask', async () => {
      const user = userEvent.setup();
      render(<TaskInput onAddTask={vi.fn()} />);

      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      await user.click(subtasksButton);

      const subtaskInput = screen.getByLabelText('New subtask title') as HTMLInputElement;
      await user.type(subtaskInput, 'Subtask to add{enter}');

      expect(subtaskInput.value).toBe('');
    });

    it('removes a subtask when clicking remove button', async () => {
      const user = userEvent.setup();
      render(<TaskInput onAddTask={vi.fn()} />);

      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      await user.click(subtasksButton);

      const subtaskInput = screen.getByLabelText('New subtask title');
      await user.type(subtaskInput, 'Subtask to remove{enter}');

      expect(screen.getByText('Subtask to remove')).toBeInTheDocument();

      const removeButton = screen.getByRole('button', { name: 'Remove subtask: Subtask to remove' });
      await user.click(removeButton);

      expect(screen.queryByText('Subtask to remove')).not.toBeInTheDocument();
    });

    it('submits with subtasks when provided', async () => {
      const user = userEvent.setup();
      const onAddTask = vi.fn();

      render(<TaskInput onAddTask={onAddTask} />);

      const input = screen.getByLabelText('New task title');
      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      const plusButton = screen.getByRole('button', { name: 'Add task' });

      await user.type(input, 'Task with subtasks');
      await user.click(subtasksButton);

      const subtaskInput = screen.getByLabelText('New subtask title');
      await user.type(subtaskInput, 'First subtask{enter}');
      await user.type(subtaskInput, 'Second subtask{enter}');

      await user.click(plusButton);

      expect(onAddTask).toHaveBeenCalledTimes(1);
      const callArgs = onAddTask.mock.calls[0];
      expect(callArgs?.[0]).toBe('Task with subtasks');
      expect(callArgs?.[5]).toHaveLength(2);
      expect(callArgs?.[5]?.[0]?.title).toBe('First subtask');
      expect(callArgs?.[5]?.[1]?.title).toBe('Second subtask');
      expect(callArgs?.[5]?.[0]?.completed).toBe(false);
      expect(callArgs?.[5]?.[1]?.completed).toBe(false);
    });

    it('submits with undefined subtasks when none are added', async () => {
      const user = userEvent.setup();
      const onAddTask = vi.fn();

      render(<TaskInput onAddTask={onAddTask} />);

      const input = screen.getByLabelText('New task title');
      const plusButton = screen.getByRole('button', { name: 'Add task' });

      await user.type(input, 'Task without subtasks');
      await user.click(plusButton);

      expect(onAddTask).toHaveBeenCalledWith('Task without subtasks', undefined, 'medium', undefined, undefined, undefined, undefined);
    });

    it('clears subtasks after submit', async () => {
      const user = userEvent.setup();
      const onAddTask = vi.fn();

      render(<TaskInput onAddTask={onAddTask} />);

      const input = screen.getByLabelText('New task title');
      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      const plusButton = screen.getByRole('button', { name: 'Add task' });

      await user.type(input, 'Task');
      await user.click(subtasksButton);

      const subtaskInput = screen.getByLabelText('New subtask title');
      await user.type(subtaskInput, 'Subtask{enter}');
      await user.click(plusButton);

      // After submit, subtasks panel should be hidden
      expect(screen.queryByLabelText('New subtask title')).not.toBeInTheDocument();
      expect(subtasksButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows subtask count indicator when subtasks are added and panel is closed', async () => {
      const user = userEvent.setup();
      render(<TaskInput onAddTask={vi.fn()} />);

      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      await user.click(subtasksButton);

      const subtaskInput = screen.getByLabelText('New subtask title');
      await user.type(subtaskInput, 'Subtask 1{enter}');
      await user.type(subtaskInput, 'Subtask 2{enter}');

      // Close subtasks panel
      await user.click(subtasksButton);

      expect(screen.getByText('2 subtasks added')).toBeInTheDocument();
    });

    it('does not add empty subtask', async () => {
      const user = userEvent.setup();
      render(<TaskInput onAddTask={vi.fn()} />);

      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      await user.click(subtasksButton);

      const subtaskInput = screen.getByLabelText('New subtask title');
      await user.type(subtaskInput, '   {enter}');

      // No subtask should be visible
      expect(screen.queryByRole('button', { name: /Remove subtask/ })).not.toBeInTheDocument();
    });

    it('disables add subtask button when input is empty', async () => {
      const user = userEvent.setup();
      render(<TaskInput onAddTask={vi.fn()} />);

      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      await user.click(subtasksButton);

      const addSubtaskButton = screen.getByRole('button', { name: 'Add subtask' });
      expect(addSubtaskButton).toBeDisabled();
    });

    it('trims whitespace from subtask title', async () => {
      const user = userEvent.setup();
      const onAddTask = vi.fn();

      render(<TaskInput onAddTask={onAddTask} />);

      const input = screen.getByLabelText('New task title');
      const subtasksButton = screen.getByRole('button', { name: 'Add subtasks' });
      const plusButton = screen.getByRole('button', { name: 'Add task' });

      await user.type(input, 'Task');
      await user.click(subtasksButton);

      const subtaskInput = screen.getByLabelText('New subtask title');
      await user.type(subtaskInput, '  Trimmed subtask  {enter}');

      await user.click(plusButton);

      const callArgs = onAddTask.mock.calls[0];
      expect(callArgs?.[5]?.[0]?.title).toBe('Trimmed subtask');
    });
  });
});
