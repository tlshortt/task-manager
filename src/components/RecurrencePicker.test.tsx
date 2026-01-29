import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecurrencePicker } from './RecurrencePicker';
import type { RecurrencePattern } from '@/types';

describe('RecurrencePicker', () => {
  it('renders with no recurrence selected', () => {
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const select = screen.getByLabelText('Recurrence frequency');
    expect(select).toHaveValue('');
  });

  it('calls onChange with daily pattern when daily is selected', () => {
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const select = screen.getByLabelText('Recurrence frequency');
    fireEvent.change(select, { target: { value: 'daily' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: 'daily',
        interval: 1,
      })
    );
  });

  it('calls onChange with weekly pattern when weekly is selected', () => {
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const select = screen.getByLabelText('Recurrence frequency');
    fireEvent.change(select, { target: { value: 'weekly' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: expect.any(Array),
      })
    );
  });

  it('shows day-of-week checkboxes when weekly is selected', () => {
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const select = screen.getByLabelText('Recurrence frequency');
    fireEvent.change(select, { target: { value: 'weekly' } });

    expect(screen.getByLabelText('Repeat on Mon')).toBeInTheDocument();
    expect(screen.getByLabelText('Repeat on Tue')).toBeInTheDocument();
    expect(screen.getByLabelText('Repeat on Wed')).toBeInTheDocument();
  });

  it('toggles days of week when clicked', () => {
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const select = screen.getByLabelText('Recurrence frequency');
    fireEvent.change(select, { target: { value: 'weekly' } });

    onChange.mockClear();

    const monButton = screen.getByLabelText('Repeat on Mon');
    fireEvent.click(monButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: 'weekly',
        daysOfWeek: expect.arrayContaining([1]),
      })
    );
  });

  it('calls onChange with monthly pattern when monthly is selected', () => {
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const select = screen.getByLabelText('Recurrence frequency');
    fireEvent.change(select, { target: { value: 'monthly' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: expect.any(Number),
      })
    );
  });

  it('shows end date picker when frequency is selected', () => {
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const select = screen.getByLabelText('Recurrence frequency');
    fireEvent.change(select, { target: { value: 'daily' } });

    expect(screen.getByLabelText('Recurrence end date')).toBeInTheDocument();
  });

  it('clears recurrence when None is selected', () => {
    const onChange = vi.fn();
    const initialPattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
    render(<RecurrencePicker value={initialPattern} onChange={onChange} />);

    const select = screen.getByLabelText('Recurrence frequency');
    fireEvent.change(select, { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('clears recurrence when Clear button is clicked', () => {
    const onChange = vi.fn();
    const initialPattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
    render(<RecurrencePicker value={initialPattern} onChange={onChange} />);

    const clearButton = screen.getByLabelText('Clear recurrence');
    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('calls onClose when Escape is pressed', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(<RecurrencePicker onChange={onChange} onClose={onClose} />);

    const select = screen.getByLabelText('Recurrence frequency');
    fireEvent.keyDown(select, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('pre-fills values from provided pattern', () => {
    const onChange = vi.fn();
    const pattern: RecurrencePattern = {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1, 3, 5],
    };
    render(<RecurrencePicker value={pattern} onChange={onChange} />);

    const select = screen.getByLabelText('Recurrence frequency');
    expect(select).toHaveValue('weekly');

    const monButton = screen.getByLabelText('Repeat on Mon');
    expect(monButton).toHaveClass('bg-purple-600');
  });
});
