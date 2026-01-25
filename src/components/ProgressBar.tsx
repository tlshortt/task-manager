interface ProgressBarProps {
  consumed: number
  estimated: number
}

export function ProgressBar({ consumed, estimated }: ProgressBarProps) {
  // Calculate percentage, capped at 100% (guard against divide by zero)
  const percentage = estimated > 0 ? Math.min((consumed / estimated) * 100, 100) : 0

  // Determine if over budget
  const isOverBudget = consumed > estimated

  // Choose fill color based on budget status
  const fillClass = isOverBudget
    ? 'bg-red-500'
    : 'bg-gradient-to-r from-purple-500 to-blue-500'

  return (
    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 w-full overflow-hidden" role="progressbar" aria-valuenow={consumed} aria-valuemin={0} aria-valuemax={estimated} aria-label={`${consumed} of ${estimated} minutes consumed`}>
      <div
        className={`${fillClass} h-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
