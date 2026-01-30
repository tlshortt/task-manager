import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskForm } from './useTaskForm';

describe('useTaskForm', () => {
  const mockOnAddTask = vi.fn();

  beforeEach(() => {
    mockOnAddTask.mockClear();
  });

  describe('form submission contract', () => {
    it('submits task with single subtask', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setTitle('Task with subtasks');
        result.current.setters.setNewSubtaskTitle('Subtask 1');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.actions.handleSubmit();
      });

      expect(mockOnAddTask).toHaveBeenCalledWith(
        'Task with subtasks',
        undefined,
        'medium',
        undefined,
        undefined,
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Subtask 1',
            completed: false,
          }),
        ]),
        undefined
      );
    });

    it('submits task with multiple subtasks', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setTitle('Multi-subtask task');
        result.current.setters.setNewSubtaskTitle('First');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.setters.setNewSubtaskTitle('Second');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.actions.handleSubmit();
      });

      expect(mockOnAddTask).toHaveBeenCalledWith(
        'Multi-subtask task',
        undefined,
        'medium',
        undefined,
        undefined,
        expect.arrayContaining([
          expect.objectContaining({ title: 'First', completed: false }),
          expect.objectContaining({ title: 'Second', completed: false }),
        ]),
        undefined
      );
    });

    it('submits task without subtasks', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setTitle('Task without subtasks');
      });

      act(() => {
        result.current.actions.handleSubmit();
      });

      expect(mockOnAddTask).toHaveBeenCalledWith(
        'Task without subtasks',
        undefined,
        'medium',
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('trims whitespace from subtask titles on submit', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setTitle('Task');
        result.current.setters.setNewSubtaskTitle('  Trimmed subtask  ');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.actions.handleSubmit();
      });

      expect(mockOnAddTask).toHaveBeenCalledWith(
        'Task',
        undefined,
        'medium',
        undefined,
        undefined,
        expect.arrayContaining([
          expect.objectContaining({ title: 'Trimmed subtask' }),
        ]),
        undefined
      );
    });

    it('excludes empty subtasks from submission', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setTitle('Task');
        result.current.setters.setNewSubtaskTitle('');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.actions.handleSubmit();
      });

      expect(mockOnAddTask).toHaveBeenCalledWith(
        'Task',
        undefined,
        'medium',
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('excludes whitespace-only subtasks from submission', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setTitle('Task');
        result.current.setters.setNewSubtaskTitle('   ');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.actions.handleSubmit();
      });

      expect(mockOnAddTask).toHaveBeenCalledWith(
        'Task',
        undefined,
        'medium',
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('submits only remaining subtasks after removal', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setTitle('Task');
        result.current.setters.setNewSubtaskTitle('First');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.setters.setNewSubtaskTitle('Second');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      const firstSubtaskId = result.current.formState.subtasks[0]!.id;

      act(() => {
        result.current.actions.removeSubtask(firstSubtaskId);
      });

      act(() => {
        result.current.actions.handleSubmit();
      });

      expect(mockOnAddTask).toHaveBeenCalledWith(
        'Task',
        undefined,
        'medium',
        undefined,
        undefined,
        expect.arrayContaining([
          expect.objectContaining({ title: 'Second' }),
        ]),
        undefined
      );

      const submittedSubtasks = mockOnAddTask.mock.calls[0]?.[5];
      expect(submittedSubtasks).toHaveLength(1);
    });

    it('enforces max 10 subtasks on submission', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setTitle('Task');
      });

      // Attempt to add 11 subtasks
      for (let i = 0; i < 11; i++) {
        act(() => {
          result.current.setters.setNewSubtaskTitle(`Subtask ${i + 1}`);
        });
        act(() => {
          result.current.actions.addSubtask();
        });
      }

      act(() => {
        result.current.actions.handleSubmit();
      });

      const submittedSubtasks = mockOnAddTask.mock.calls[0]?.[5];
      expect(submittedSubtasks).toHaveLength(10);
    });

    it('allows resubmission after reset', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      // First submission
      act(() => {
        result.current.setters.setTitle('First task');
        result.current.setters.setNewSubtaskTitle('First subtask');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.actions.handleSubmit();
      });

      expect(mockOnAddTask).toHaveBeenCalledTimes(1);

      // Reset and second submission
      act(() => {
        result.current.actions.resetForm();
        result.current.setters.setTitle('Second task');
        result.current.setters.setNewSubtaskTitle('Second subtask');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.actions.handleSubmit();
      });

      expect(mockOnAddTask).toHaveBeenCalledTimes(2);
      expect(mockOnAddTask).toHaveBeenLastCalledWith(
        'Second task',
        undefined,
        'medium',
        undefined,
        undefined,
        expect.arrayContaining([
          expect.objectContaining({ title: 'Second subtask' }),
        ]),
        undefined
      );
    });
  });
});
