import List from 'lucide-react/dist/esm/icons/list';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import type { ViewMode } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <Tabs value={viewMode} onValueChange={(value) => onChange(value as ViewMode)} className="mb-6">
      <TabsList className="gap-1" aria-label="View mode">
        {modes.map(({ key, label, Icon }) => (
          <TabsTrigger
            key={key}
            value={key}
            aria-label={`${label} view`}
            className="flex items-center gap-1.5"
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
