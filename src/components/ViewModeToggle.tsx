import List from 'lucide-react/dist/esm/icons/list';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import type { ViewMode } from '@/types';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ viewMode, onChange }: ViewModeToggleProps) {
  const modes: { key: ViewMode; label: string; Icon: typeof List }[] = [
    { key: 'list', label: 'List', Icon: List },
    { key: 'calendar', label: 'Calendar', Icon: Calendar },
  ];

  return (
    <div className="flex gap-1 mb-6" role="tablist" aria-label="View mode">
      {modes.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          role="tab"
          aria-selected={viewMode === key}
          aria-label={`${label} view`}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
            ${
              viewMode === key
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  );
}
