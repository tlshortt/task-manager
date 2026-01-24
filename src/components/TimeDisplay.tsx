interface TimeDisplayProps {
  minutes: number | undefined;
  variant?: 'default' | 'consumed';
}

export function TimeDisplay({ minutes, variant = 'default' }: TimeDisplayProps) {
  const formatTime = (mins: number | undefined): string => {
    if (!mins || mins === 0) return '';

    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (hours === 0) return `${remainingMins}m`;
    if (remainingMins === 0) return `${hours}hr`;
    return `${hours}hr ${remainingMins}m`;
  };

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
