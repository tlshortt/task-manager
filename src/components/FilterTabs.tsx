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
    <div className="flex gap-8 mb-6" role="tablist" aria-label="Task filters">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          role="tab"
          aria-selected={filter === tab.key}
          aria-label={`${tab.label} tasks (${tab.count})`}
          className={`
            pb-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-sm border-b-2
            ${
              filter === tab.key
                ? 'font-medium text-navy-900 dark:text-white border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'
            }
          `}
        >
          {tab.label}
          <span className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full px-2 text-xs ml-2">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
