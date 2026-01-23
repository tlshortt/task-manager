import { Moon, Sun } from 'lucide-react';
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
      <h1 className="text-2xl font-bold text-navy-900">Tasks</h1>

      {/* Right: Date and dark mode toggle */}
      <div className="flex items-center gap-4">
        <span className="text-gray-500 text-sm">{today}</span>
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-gray-600" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
}
