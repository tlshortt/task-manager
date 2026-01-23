import type { FilterType } from '@/types';

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
    <div className="flex gap-8 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={`
            pb-2 transition-colors
            ${
              filter === tab.key
                ? 'font-medium text-navy-900 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }
          `}
        >
          {tab.label}
          <span className="bg-gray-100 rounded-full px-2 text-xs ml-2">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
