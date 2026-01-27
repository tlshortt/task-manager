import { describe, it, expect } from 'vitest';
import type { Subtask, Priority } from './index';

describe('Subtask type', () => {
  it('should allow creating a subtask with required fields only', () => {
    const subtask: Subtask = {
      id: '1',
      title: 'Test subtask',
      completed: false,
    };

    expect(subtask.id).toBe('1');
    expect(subtask.title).toBe('Test subtask');
    expect(subtask.completed).toBe(false);
    expect(subtask.priority).toBeUndefined();
    expect(subtask.dueDate).toBeUndefined();
  });

  it('should allow creating a subtask with priority', () => {
    const subtask: Subtask = {
      id: '2',
      title: 'High priority subtask',
      completed: false,
      priority: 'high',
    };

    expect(subtask.priority).toBe('high');
  });

  it('should allow creating a subtask with dueDate', () => {
    const dueDate = new Date('2025-12-31');
    const subtask: Subtask = {
      id: '3',
      title: 'Subtask with due date',
      completed: false,
      dueDate,
    };

    expect(subtask.dueDate).toBe(dueDate);
  });

  it('should allow creating a subtask with both priority and dueDate', () => {
    const dueDate = new Date('2025-06-15');
    const subtask: Subtask = {
      id: '4',
      title: 'Full subtask',
      completed: true,
      priority: 'medium',
      dueDate,
    };

    expect(subtask.id).toBe('4');
    expect(subtask.title).toBe('Full subtask');
    expect(subtask.completed).toBe(true);
    expect(subtask.priority).toBe('medium');
    expect(subtask.dueDate).toBe(dueDate);
  });

  it('should accept all valid priority values', () => {
    const priorities: Priority[] = ['low', 'medium', 'high'];

    priorities.forEach((priority) => {
      const subtask: Subtask = {
        id: '5',
        title: 'Priority test',
        completed: false,
        priority,
      };

      expect(subtask.priority).toBe(priority);
    });
  });
});
