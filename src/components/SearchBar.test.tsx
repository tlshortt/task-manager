import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<SearchBar value="test query" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'search');

    expect(onChange).toHaveBeenCalledTimes(6); // Once per character
  });

  it('shows clear button when value is not empty', () => {
    render(<SearchBar value="search" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('clears value when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar value="search" onChange={onChange} />);

    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('focuses input when ref.current.focus is called', () => {
    const ref = createRef<HTMLInputElement>();
    render(<SearchBar value="" onChange={vi.fn()} ref={ref} />);

    const input = screen.getByRole('textbox');
    expect(input).not.toHaveFocus();

    ref.current?.focus();
    expect(input).toHaveFocus();
  });
});
