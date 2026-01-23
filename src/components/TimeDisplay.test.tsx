import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimeDisplay } from './TimeDisplay';

describe('TimeDisplay', () => {
  it('formats 90 minutes as 1hr 30m', () => {
    render(<TimeDisplay minutes={90} />);
    expect(screen.getByText('1hr 30m')).toBeInTheDocument();
  });

  it('formats 45 minutes as 45m', () => {
    render(<TimeDisplay minutes={45} />);
    expect(screen.getByText('45m')).toBeInTheDocument();
  });

  it('formats 120 minutes as 2hr', () => {
    render(<TimeDisplay minutes={120} />);
    expect(screen.getByText('2hr')).toBeInTheDocument();
  });

  it('formats 0 as --', () => {
    render(<TimeDisplay minutes={0} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('formats undefined as --', () => {
    render(<TimeDisplay minutes={undefined} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    const { container } = render(<TimeDisplay minutes={60} />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('text-gray-600');
    expect(span).not.toHaveClass('text-purple-600');
  });

  it('applies consumed variant styles', () => {
    const { container } = render(<TimeDisplay minutes={60} variant="consumed" />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('text-purple-600');
    expect(span).toHaveClass('font-medium');
  });
});
