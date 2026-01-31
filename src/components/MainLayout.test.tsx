import { forwardRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainLayout } from './MainLayout';
import type { CategoryFilter, PriorityFilter, RecurrenceFilter, Tag } from '@/types';

interface FilterDropdownsProps {
  tags: Tag[] | undefined;
  recurrence: RecurrenceFilter;
  category: CategoryFilter;
  priority: PriorityFilter;
  onRecurrenceChange: (value: RecurrenceFilter) => void;
  onCategoryChange: (value: CategoryFilter) => void;
  onPriorityChange: (value: PriorityFilter) => void;
}

vi.mock('./FilterDropdowns', () => ({
  FilterDropdowns: ({
    recurrence,
    category,
    priority,
    onRecurrenceChange,
    onCategoryChange,
    onPriorityChange,
  }: FilterDropdownsProps) => (
    <div>
      <div data-testid="recurrence-value">{recurrence}</div>
      <div data-testid="category-value">{category}</div>
      <div data-testid="priority-value">{priority}</div>
      <button type="button" onClick={() => onRecurrenceChange('weekly')}>
        set-recurrence
      </button>
      <button type="button" onClick={() => onCategoryChange('uncategorized')}>
        set-category
      </button>
      <button type="button" onClick={() => onPriorityChange('high')}>
        set-priority
      </button>
    </div>
  ),
}));

vi.mock('./AppHeader', () => ({
  AppHeader: () => <div data-testid="app-header" />,
}));

vi.mock('./FilterTabs', () => ({
  FilterTabs: () => <div data-testid="filter-tabs" />,
}));

vi.mock('./SearchBar', () => ({
  SearchBar: forwardRef(() => <div data-testid="search-bar" />),
}));

vi.mock('./TaskInput', () => ({
  TaskInput: forwardRef(() => <div data-testid="task-input" />),
}));

vi.mock('./TaskDateGroup', () => ({
  TaskDateGroup: () => <div data-testid="task-date-group" />,
}));

vi.mock('./RecurringTaskGroup', () => ({
  RecurringTaskGroup: () => <div data-testid="recurring-task-group" />,
}));

vi.mock('./ViewModeToggle', () => ({
  ViewModeToggle: () => <div data-testid="view-mode-toggle" />,
}));

vi.mock('./calendar', () => ({
  CalendarView: () => <div data-testid="calendar-view" />,
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));

vi.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: () => undefined,
}));

vi.mock('@/hooks/useDarkMode', () => ({
  useDarkMode: () => ({ isDark: false, toggle: vi.fn() }),
}));

vi.mock('@/hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: [
      {
        id: 'task-1',
        title: 'MainLayout task',
        completed: false,
        priority: 'medium',
        createdAt: new Date('2026-01-30T00:00:00.000Z'),
        updatedAt: new Date('2026-01-30T00:00:00.000Z'),
      },
    ],
    isLoading: false,
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleComplete: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTags', () => ({
  useTags: () => ({ tags: [], isLoading: false, createTag: vi.fn(), removeTag: vi.fn() }),
}));

describe('MainLayout', () => {
  it('tracks filter selections and wires handlers to dropdowns', async () => {
    const user = userEvent.setup();

    render(<MainLayout />);

    expect(screen.getByTestId('recurrence-value')).toHaveTextContent('all');
    expect(screen.getByTestId('category-value')).toHaveTextContent('all');
    expect(screen.getByTestId('priority-value')).toHaveTextContent('all');

    await user.click(screen.getByRole('button', { name: 'set-recurrence' }));
    await user.click(screen.getByRole('button', { name: 'set-category' }));
    await user.click(screen.getByRole('button', { name: 'set-priority' }));

    expect(screen.getByTestId('recurrence-value')).toHaveTextContent('weekly');
    expect(screen.getByTestId('category-value')).toHaveTextContent('uncategorized');
    expect(screen.getByTestId('priority-value')).toHaveTextContent('high');
  });
});
