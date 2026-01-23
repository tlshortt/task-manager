import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PriorityBadge } from './PriorityBadge';

describe('PriorityBadge', () => {
  it('renders red color for high priority', () => {
    const { container } = render(<PriorityBadge priority="high" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-red-500');
  });

  it('renders amber color for medium priority', () => {
    const { container } = render(<PriorityBadge priority="medium" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-amber-500');
  });

  it('renders gray color for low priority', () => {
    const { container } = render(<PriorityBadge priority="low" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-gray-400');
  });
});
