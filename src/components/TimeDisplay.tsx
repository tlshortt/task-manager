import { formatTime } from '@/utils/dateUtils';

interface TimeDisplayProps {
  minutes: number | undefined;
  variant?: 'default' | 'consumed';
}

export function TimeDisplay({ minutes, variant = 'default' }: TimeDisplayProps) {

  const variantStyles = {
    default: 'text-gray-600 dark:text-gray-400',
    consumed: 'text-purple-600 dark:text-purple-400 font-medium'
  };

  return (
    <span className={`text-sm tabular-nums ${variantStyles[variant]}`}>
      {formatTime(minutes)}
    </span>
  );
}
