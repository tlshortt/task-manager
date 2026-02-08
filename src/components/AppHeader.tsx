import Moon from 'lucide-react/dist/esm/icons/moon';
import Sun from 'lucide-react/dist/esm/icons/sun';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  isDark: boolean;
  onToggleDarkMode: () => void;
}

export function AppHeader({ isDark, onToggleDarkMode }: AppHeaderProps) {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="flex items-center justify-between py-6 mb-2">
      {/* Left spacer */}
      <div />

      {/* Right: Date and dark mode toggle */}
      <div className="flex items-center gap-4">
        <span className="text-gray-500 dark:text-gray-400 text-sm">{today}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDarkMode}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </Button>
      </div>
    </div>
  );
}
