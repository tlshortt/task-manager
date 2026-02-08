import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecurrencePicker } from './RecurrencePicker';
import type { RecurrencePattern } from '@/types';

describe('RecurrencePicker', () => {
  it('renders with no recurrence selected', () => {
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const trigger = screen.getByRole('combobox', { name: 'Recurrence frequency' });
    expect(trigger).toBeInTheDocument();
    // Default is 'None' when no value is provided
    expect(trigger).toHaveTextContent('None');
  });

  it('calls onChange with daily pattern when daily is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const trigger = screen.getByRole('combobox', { name: 'Recurrence frequency' });
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Daily' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: 'daily',
        interval: 1,
      })
    );
  });

  it('calls onChange with weekly pattern when weekly is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const trigger = screen.getByRole('combobox', { name: 'Recurrence frequency' });
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Weekly' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: expect.any(Array),
      })
    );
  });

  it('shows day-of-week checkboxes when weekly is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const trigger = screen.getByRole('combobox', { name: 'Recurrence frequency' });
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Weekly' }));

    expect(screen.getByLabelText('Repeat on Mon')).toBeInTheDocument();
    expect(screen.getByLabelText('Repeat on Tue')).toBeInTheDocument();
    expect(screen.getByLabelText('Repeat on Wed')).toBeInTheDocument();
  });

  it('toggles days of week when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const trigger = screen.getByRole('combobox', { name: 'Recurrence frequency' });
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Weekly' }));

    onChange.mockClear();

    // Click on a day that's not the current day to ensure we're adding, not removing
    const tueButton = screen.getByLabelText('Repeat on Tue');
    await user.click(tueButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: 'weekly',
        daysOfWeek: expect.arrayContaining([2]),
      })
    );
  });

  it('calls onChange with monthly pattern when monthly is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const trigger = screen.getByRole('combobox', { name: 'Recurrence frequency' });
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Monthly' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: expect.any(Number),
      })
    );
  });

  it('shows end date picker when frequency is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RecurrencePicker onChange={onChange} />);

    const trigger = screen.getByRole('combobox', { name: 'Recurrence frequency' });
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Daily' }));

    // End date section shows "Ends on (optional):" label
    expect(screen.getByText('Ends on (optional):')).toBeInTheDocument();
  });

  it('clears recurrence when None is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const initialPattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
    render(<RecurrencePicker value={initialPattern} onChange={onChange} />);

    const trigger = screen.getByRole('combobox', { name: 'Recurrence frequency' });
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'None' }));

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

    const container = screen.getByRole('combobox', { name: 'Recurrence frequency' }).closest('.space-y-3')!;
    fireEvent.keyDown(container, { key: 'Escape' });

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

    const trigger = screen.getByRole('combobox', { name: 'Recurrence frequency' });
    expect(trigger).toHaveTextContent('Weekly');

    // Mon button should be pressed (Toggle with data-state=on)
    const monButton = screen.getByLabelText('Repeat on Mon');
    expect(monButton).toHaveAttribute('data-state', 'on');
  });
});
