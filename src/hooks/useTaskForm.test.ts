import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskForm } from './useTaskForm';

describe('useTaskForm', () => {
  const mockOnAddTask = vi.fn();

  beforeEach(() => {
    mockOnAddTask.mockClear();
  });

  describe('subtasks state', () => {
    it('initializes with empty subtasks array', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      expect(result.current.formState.subtasks).toEqual([]);
    });

    it('initializes with showSubtasks as false', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      expect(result.current.formState.showSubtasks).toBe(false);
    });

    it('initializes with empty newSubtaskTitle', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      expect(result.current.formState.newSubtaskTitle).toBe('');
    });

    it('exposes setShowSubtasks setter', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setShowSubtasks(true);
      });

      expect(result.current.formState.showSubtasks).toBe(true);
    });

    it('exposes setNewSubtaskTitle setter', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setNewSubtaskTitle('Test subtask');
      });

      expect(result.current.formState.newSubtaskTitle).toBe('Test subtask');
    });
  });

  describe('addSubtask action', () => {
    it('adds a subtask with correct properties', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setNewSubtaskTitle('My subtask');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      expect(result.current.formState.subtasks).toHaveLength(1);
      expect(result.current.formState.subtasks[0].title).toBe('My subtask');
      expect(result.current.formState.subtasks[0].completed).toBe(false);
      expect(result.current.formState.subtasks[0].id).toBeDefined();
    });

    it('clears newSubtaskTitle after adding', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setNewSubtaskTitle('My subtask');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      expect(result.current.formState.newSubtaskTitle).toBe('');
    });

    it('trims whitespace from subtask title', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setNewSubtaskTitle('  Trimmed subtask  ');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      expect(result.current.formState.subtasks[0].title).toBe('Trimmed subtask');
    });

    it('does not add subtask with empty title', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setNewSubtaskTitle('');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      expect(result.current.formState.subtasks).toHaveLength(0);
    });

    it('does not add subtask with whitespace-only title', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setNewSubtaskTitle('   ');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      expect(result.current.formState.subtasks).toHaveLength(0);
    });

    it('enforces max 10 subtasks limit', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      // Add 10 subtasks
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setters.setNewSubtaskTitle(`Subtask ${i + 1}`);
        });
        act(() => {
          result.current.actions.addSubtask();
        });
      }

      expect(result.current.formState.subtasks).toHaveLength(10);

      // Try to add 11th subtask
      act(() => {
        result.current.setters.setNewSubtaskTitle('Subtask 11');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      expect(result.current.formState.subtasks).toHaveLength(10);
    });

    it('allows adding subtask after removing one when at max', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      // Add 10 subtasks
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setters.setNewSubtaskTitle(`Subtask ${i + 1}`);
        });
        act(() => {
          result.current.actions.addSubtask();
        });
      }

      const firstSubtaskId = result.current.formState.subtasks[0].id;

      // Remove one
      act(() => {
        result.current.actions.removeSubtask(firstSubtaskId);
      });

      expect(result.current.formState.subtasks).toHaveLength(9);

      // Now adding should work
      act(() => {
        result.current.setters.setNewSubtaskTitle('New subtask');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      expect(result.current.formState.subtasks).toHaveLength(10);
    });
  });

  describe('removeSubtask action', () => {
    it('removes a subtask by id', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setNewSubtaskTitle('Subtask to remove');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      const subtaskId = result.current.formState.subtasks[0].id;

      act(() => {
        result.current.actions.removeSubtask(subtaskId);
      });

      expect(result.current.formState.subtasks).toHaveLength(0);
    });

    it('only removes the specified subtask', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setNewSubtaskTitle('First subtask');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.setters.setNewSubtaskTitle('Second subtask');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      const firstSubtaskId = result.current.formState.subtasks[0].id;

      act(() => {
        result.current.actions.removeSubtask(firstSubtaskId);
      });

      expect(result.current.formState.subtasks).toHaveLength(1);
      expect(result.current.formState.subtasks[0].title).toBe('Second subtask');
    });

    it('does nothing when removing non-existent id', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setNewSubtaskTitle('Subtask');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.actions.removeSubtask('non-existent-id');
      });

      expect(result.current.formState.subtasks).toHaveLength(1);
    });
  });

  describe('resetForm', () => {
    it('clears subtasks array', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setNewSubtaskTitle('Subtask');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.actions.resetForm();
      });

      expect(result.current.formState.subtasks).toEqual([]);
    });

    it('resets showSubtasks to false', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setShowSubtasks(true);
      });

      act(() => {
        result.current.actions.resetForm();
      });

      expect(result.current.formState.showSubtasks).toBe(false);
    });

    it('clears newSubtaskTitle', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setNewSubtaskTitle('Pending subtask');
      });

      act(() => {
        result.current.actions.resetForm();
      });

      expect(result.current.formState.newSubtaskTitle).toBe('');
    });
  });

  describe('handleSubmit', () => {
    it('includes subtasks when submitting', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setTitle('Task with subtasks');
      });

      act(() => {
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
        ])
      );
    });

    it('passes undefined for subtasks when array is empty', () => {
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
        undefined
      );
    });

    it('clears subtasks after submit', () => {
      const { result } = renderHook(() => useTaskForm({ onAddTask: mockOnAddTask }));

      act(() => {
        result.current.setters.setTitle('Task');
      });

      act(() => {
        result.current.setters.setNewSubtaskTitle('Subtask');
      });

      act(() => {
        result.current.actions.addSubtask();
      });

      act(() => {
        result.current.actions.handleSubmit();
      });

      expect(result.current.formState.subtasks).toEqual([]);
    });
  });
});
