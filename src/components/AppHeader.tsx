import Moon from 'lucide-react/dist/esm/icons/moon';
import Sun from 'lucide-react/dist/esm/icons/sun';
import { format } from 'date-fns';

interface AppHeaderProps {
  isDark: boolean;
  onToggleDarkMode: () => void;
}

export function AppHeader({ isDark, onToggleDarkMode }: AppHeaderProps) {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="flex items-center justify-between py-6 mb-2">
      {/* Left: App title */}
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Tasks</h1>

      {/* Right: Date and dark mode toggle */}
      <div className="flex items-center gap-4">
        <span className="text-gray-500 dark:text-gray-400 text-sm">{today}</span>
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
}
