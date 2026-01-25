import type { FilterType } from '@/types';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Inbox from 'lucide-react/dist/esm/icons/inbox';

interface EmptyStateProps {
  filter: FilterType;
  searchQuery?: string;
}

export function EmptyState({ filter, searchQuery }: EmptyStateProps) {
  // Show search-specific empty state if searching
  if (searchQuery && searchQuery.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No tasks found matching "{searchQuery}"
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          Try a different search term
        </p>
      </div>
    );
  }

  const getContent = () => {
    switch (filter) {
      case 'current':
        return {
          icon: <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600" />,
          message: 'No tasks yet',
          subtitle: 'Add a task above to get started',
        };
      case 'overdue':
        return {
          icon: <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600" />,
          message: 'No overdue tasks',
          subtitle: 'All caught up!',
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-600" />,
          message: 'No completed tasks',
          subtitle: 'Complete a task to see it here',
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
      <div className="mb-4" aria-hidden="true">{content.icon}</div>
      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">
        {content.message}
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500">{content.subtitle}</p>
    </div>
  );
}
