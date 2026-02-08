import Search from 'lucide-react/dist/esm/icons/search';
import X from 'lucide-react/dist/esm/icons/x';
import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, placeholder = 'Search tasks...' }, ref) => {
    return (
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>

        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search tasks"
          className="w-full pl-11 pr-10 py-3 h-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />

        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 mr-1 my-auto h-8 w-8"
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </Button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
