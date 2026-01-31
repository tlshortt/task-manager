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

describe('FilterDropdowns', () => {
  it('renders recurrence options with default selection', () => {
    render(
      <FilterDropdowns
        tags={tags}
        recurrence="all"
        category="all"
        priority="all"
        onRecurrenceChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onPriorityChange={vi.fn()}
      />
    );

    const recurrenceSelect = screen.getByLabelText('Recurrence') as HTMLSelectElement;
    expect(recurrenceSelect.value).toBe('all');
    expect(screen.getByRole('option', { name: 'Recurring' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Non-recurring' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Daily' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Weekly' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Monthly' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Yearly' })).toBeInTheDocument();
  });

  it('sorts category tags A to Z after All and Uncategorized', () => {
    render(
      <FilterDropdowns
        tags={tags}
        recurrence="all"
        category="all"
        priority="all"
        onRecurrenceChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onPriorityChange={vi.fn()}
      />
    );

    const categorySelect = screen.getByLabelText('Category') as HTMLSelectElement;
    const options = Array.from(categorySelect.options).map((option) => option.textContent);
    expect(options).toEqual(['All', 'Uncategorized', 'Alpha', 'Work']);
  });

  it('shows only All and Uncategorized when no tags', () => {
    render(
      <FilterDropdowns
        tags={[]}
        recurrence="all"
        category="all"
        priority="all"
        onRecurrenceChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onPriorityChange={vi.fn()}
      />
    );

    const categorySelect = screen.getByLabelText('Category') as HTMLSelectElement;
    const options = Array.from(categorySelect.options).map((option) => option.textContent);
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
      />
    );

    await user.selectOptions(screen.getByLabelText('Recurrence'), 'weekly');
    await user.selectOptions(screen.getByLabelText('Category'), tags[0]!.id);
    await user.selectOptions(screen.getByLabelText('Priority'), 'high');

    expect(onRecurrenceChange).toHaveBeenCalledWith('weekly');
    expect(onCategoryChange).toHaveBeenCalledWith(tags[0]!.id);
    expect(onPriorityChange).toHaveBeenCalledWith('high');
  });
});
