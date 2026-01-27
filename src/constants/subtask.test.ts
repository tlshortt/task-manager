import { describe, it, expect } from 'vitest';
import {
  MAX_SUBTASKS_PER_TASK,
  MAX_SUBTASK_TITLE_LENGTH,
  MIN_SUBTASK_TITLE_LENGTH,
} from './subtask';

describe('subtask constants', () => {
  describe('MAX_SUBTASKS_PER_TASK', () => {
    it('should be a positive number', () => {
      expect(MAX_SUBTASKS_PER_TASK).toBeGreaterThan(0);
    });

    it('should be 20', () => {
      expect(MAX_SUBTASKS_PER_TASK).toBe(20);
    });
  });

  describe('MAX_SUBTASK_TITLE_LENGTH', () => {
    it('should be a positive number', () => {
      expect(MAX_SUBTASK_TITLE_LENGTH).toBeGreaterThan(0);
    });

    it('should be 200', () => {
      expect(MAX_SUBTASK_TITLE_LENGTH).toBe(200);
    });
  });

  describe('MIN_SUBTASK_TITLE_LENGTH', () => {
    it('should be a positive number', () => {
      expect(MIN_SUBTASK_TITLE_LENGTH).toBeGreaterThan(0);
    });

    it('should be 1', () => {
      expect(MIN_SUBTASK_TITLE_LENGTH).toBe(1);
    });

    it('should be less than MAX_SUBTASK_TITLE_LENGTH', () => {
      expect(MIN_SUBTASK_TITLE_LENGTH).toBeLessThan(MAX_SUBTASK_TITLE_LENGTH);
    });
  });
});
