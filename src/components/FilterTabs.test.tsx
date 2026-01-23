import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterTabs } from './FilterTabs';

describe('FilterTabs', () => {
  const mockCounts = {
    current: 5,
    overdue: 2,
    completed: 3,
  };

  it('renders all three tabs with labels', () => {
    const onFilterChange = vi.fn();

    render(
      <FilterTabs
        filter="current"
        onFilterChange={onFilterChange}
        counts={mockCounts}
      />
    );

    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays count badges for each tab', () => {
    const onFilterChange = vi.fn();

    render(
      <FilterTabs
        filter="current"
        onFilterChange={onFilterChange}
        counts={mockCounts}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onFilterChange when tab is clicked', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <FilterTabs
        filter="current"
        onFilterChange={onFilterChange}
        counts={mockCounts}
      />
    );

    const overdueTab = screen.getByText('Overdue').closest('button');
    if (overdueTab) {
      await user.click(overdueTab);
    }

    expect(onFilterChange).toHaveBeenCalledWith('overdue');
    expect(onFilterChange).toHaveBeenCalledTimes(1);
  });

  it('applies active styling to current filter', () => {
    const onFilterChange = vi.fn();

    render(
      <FilterTabs
        filter="overdue"
        onFilterChange={onFilterChange}
        counts={mockCounts}
      />
    );

    const overdueTab = screen.getByText('Overdue').closest('button');
    expect(overdueTab?.className).toContain('text-navy-900');
    expect(overdueTab?.className).toContain('border-purple-600');
  });

  it('applies inactive styling to non-active tabs', () => {
    const onFilterChange = vi.fn();

    render(
      <FilterTabs
        filter="overdue"
        onFilterChange={onFilterChange}
        counts={mockCounts}
      />
    );

    const currentTab = screen.getByText('Current').closest('button');
    expect(currentTab?.className).toContain('text-gray-500');
    expect(currentTab?.className).not.toContain('border-purple-600');
  });

  it('switches active tab when different filter is selected', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    const { rerender } = render(
      <FilterTabs
        filter="current"
        onFilterChange={onFilterChange}
        counts={mockCounts}
      />
    );

    const completedTab = screen.getByText('Completed').closest('button');
    if (completedTab) {
      await user.click(completedTab);
    }

    expect(onFilterChange).toHaveBeenCalledWith('completed');

    // Simulate parent updating the filter prop
    rerender(
      <FilterTabs
        filter="completed"
        onFilterChange={onFilterChange}
        counts={mockCounts}
      />
    );

    const completedTabAfter = screen.getByText('Completed').closest('button');
    expect(completedTabAfter?.className).toContain('text-navy-900');
    expect(completedTabAfter?.className).toContain('border-purple-600');
  });
});
