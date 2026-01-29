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

  it('marks current filter as selected', () => {
    const onFilterChange = vi.fn();

    render(
      <FilterTabs
        filter="overdue"
        onFilterChange={onFilterChange}
        counts={mockCounts}
      />
    );

    const overdueTab = screen.getByRole('tab', { name: /overdue/i });
    expect(overdueTab).toHaveAttribute('aria-selected', 'true');
  });

  it('marks non-active tabs as not selected', () => {
    const onFilterChange = vi.fn();

    render(
      <FilterTabs
        filter="overdue"
        onFilterChange={onFilterChange}
        counts={mockCounts}
      />
    );

    const currentTab = screen.getByRole('tab', { name: /current/i });
    expect(currentTab).toHaveAttribute('aria-selected', 'false');
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

    const completedTab = screen.getByRole('tab', { name: /completed/i });
    await user.click(completedTab);

    expect(onFilterChange).toHaveBeenCalledWith('completed');

    // Simulate parent updating the filter prop
    rerender(
      <FilterTabs
        filter="completed"
        onFilterChange={onFilterChange}
        counts={mockCounts}
      />
    );

    const completedTabAfter = screen.getByRole('tab', { name: /completed/i });
    expect(completedTabAfter).toHaveAttribute('aria-selected', 'true');
  });
});
