import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from './useTasks';
import { db } from '@/db';

describe('useTasks', () => {
  beforeEach(async () => {
    await db.tasks.clear();
  });

  it('should add a task with default priority and timestamps', async () => {
    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.addTask({
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        priority: 'high',
      });
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const task = result.current.tasks?.[0];
    expect(task?.title).toBe('Test Task');
    expect(task?.description).toBe('Test Description');
    expect(task?.priority).toBe('high');
    expect(task?.completed).toBe(false);
    expect(task?.createdAt).toBeInstanceOf(Date);
    expect(task?.updatedAt).toBeInstanceOf(Date);
  });

  it('should use medium as default priority', async () => {
    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.addTask({
        title: 'Test Task',
        completed: false,
        priority: undefined as any,
      });
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    expect(result.current.tasks?.[0]?.priority).toBe('medium');
  });

  it('should delete a task', async () => {
    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.addTask({
        title: 'Test Task',
        completed: false,
        priority: 'low',
      });
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const taskId = result.current.tasks?.[0]?.id;
    expect(taskId).toBeDefined();

    await act(async () => {
      await result.current.deleteTask(taskId!);
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(0);
    });
  });

  it('should toggle task completion', async () => {
    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.addTask({
        title: 'Test Task',
        completed: false,
        priority: 'medium',
      });
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const taskId = result.current.tasks?.[0]?.id;
    expect(result.current.tasks?.[0]?.completed).toBe(false);

    await act(async () => {
      await result.current.toggleComplete(taskId!);
    });

    await waitFor(() => {
      expect(result.current.tasks?.[0]?.completed).toBe(true);
    });

    await act(async () => {
      await result.current.toggleComplete(taskId!);
    });

    await waitFor(() => {
      expect(result.current.tasks?.[0]?.completed).toBe(false);
    });
  });

  it('should return loading state', () => {
    const { result } = renderHook(() => useTasks());

    // Initially loading
    if (result.current.tasks === undefined) {
      expect(result.current.isLoading).toBe(true);
    }
  });
});
