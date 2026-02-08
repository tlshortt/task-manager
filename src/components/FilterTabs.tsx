import type { FilterType } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FilterTabsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    current: number;
    overdue: number;
    completed: number;
  };
}

export function FilterTabs({ filter, onFilterChange, counts }: FilterTabsProps) {
  const tabs: { key: FilterType; label: string; count: number }[] = [
    { key: 'current', label: 'Current', count: counts.current },
    { key: 'overdue', label: 'Overdue', count: counts.overdue },
    { key: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <Tabs value={filter} onValueChange={(value) => onFilterChange(value as FilterType)} className="mb-6">
      <TabsList className="bg-transparent gap-8 h-auto p-0" aria-label="Task filters">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            aria-label={`${tab.label} tasks (${tab.count})`}
            className="pb-2 px-0 rounded-none border-b-2 border-transparent shadow-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-purple-600 data-[state=active]:font-medium data-[state=active]:text-navy-900 dark:data-[state=active]:text-white text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {tab.label}
            <span className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full px-2 text-xs ml-2">
              {tab.count}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
