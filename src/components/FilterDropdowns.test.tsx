import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterDropdowns } from './FilterDropdowns';
import { testId } from '@/types';
import type { Tag } from '@/types';

const tags: Tag[] = [
  { id: testId('2'), name: 'Work', color: 'blue' },
  { id: testId('1'), name: 'Alpha', color: 'green' },
];

const defaultSortProps = {
  sortField: 'dueDate' as const,
  sortDirection: 'asc' as const,
  onSortFieldChange: vi.fn(),
  onSortDirectionToggle: vi.fn(),
};

describe('FilterDropdowns', () => {
  it('renders recurrence options with default selection', async () => {
    const user = userEvent.setup();
    render(
      <FilterDropdowns
        tags={tags}
        recurrence="all"
        category="all"
        priority="all"
        onRecurrenceChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onPriorityChange={vi.fn()}
        {...defaultSortProps}
      />
    );

    // Radix Select renders a trigger button; click to open dropdown
    const recurrenceTrigger = screen.getByRole('combobox', { name: 'Recurrence' });
    expect(recurrenceTrigger).toBeInTheDocument();

    await user.click(recurrenceTrigger);

    // Options are rendered inside the portal
    expect(screen.getByRole('option', { name: 'Recurring' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Non-recurring' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Daily' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Weekly' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Monthly' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Yearly' })).toBeInTheDocument();
  });

  it('sorts category tags A to Z after All and Uncategorized', async () => {
    const user = userEvent.setup();
    render(
      <FilterDropdowns
        tags={tags}
        recurrence="all"
        category="all"
        priority="all"
        onRecurrenceChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onPriorityChange={vi.fn()}
        {...defaultSortProps}
      />
    );

    const categoryTrigger = screen.getByRole('combobox', { name: 'Category' });
    await user.click(categoryTrigger);

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual(['All', 'Uncategorized', 'Alpha', 'Work']);
  });

  it('shows only All and Uncategorized when no tags', async () => {
    const user = userEvent.setup();
    render(
      <FilterDropdowns
        tags={[]}
        recurrence="all"
        category="all"
        priority="all"
        onRecurrenceChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onPriorityChange={vi.fn()}
        {...defaultSortProps}
      />
    );

    const categoryTrigger = screen.getByRole('combobox', { name: 'Category' });
    await user.click(categoryTrigger);

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual(['All', 'Uncategorized']);
  });

  it('calls handlers when selections change', async () => {
    const user = userEvent.setup();
    const onRecurrenceChange = vi.fn();
    const onCategoryChange = vi.fn();
    const onPriorityChange = vi.fn();

    render(
      <FilterDropdowns
        tags={tags}
        recurrence="all"
        category="all"
        priority="all"
        onRecurrenceChange={onRecurrenceChange}
        onCategoryChange={onCategoryChange}
        onPriorityChange={onPriorityChange}
        {...defaultSortProps}
      />
    );

    // Change recurrence
    const recurrenceTrigger = screen.getByRole('combobox', { name: 'Recurrence' });
    await user.click(recurrenceTrigger);
    await user.click(screen.getByRole('option', { name: 'Weekly' }));
    expect(onRecurrenceChange).toHaveBeenCalledWith('weekly');

    // Change category
    const categoryTrigger = screen.getByRole('combobox', { name: 'Category' });
    await user.click(categoryTrigger);
    await user.click(screen.getByRole('option', { name: 'Work' }));
    expect(onCategoryChange).toHaveBeenCalledWith(tags[0]!.id);

    // Change priority
    const priorityTrigger = screen.getByRole('combobox', { name: 'Priority' });
    await user.click(priorityTrigger);
    await user.click(screen.getByRole('option', { name: 'High' }));
    expect(onPriorityChange).toHaveBeenCalledWith('high');
  });
});
