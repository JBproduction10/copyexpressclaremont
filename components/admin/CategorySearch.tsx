//components/admin/CategorySearch.tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface CategorySearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const CategorySearch: React.FC<CategorySearchProps> = ({ 
  onSearch, 
  placeholder = "Search categories..." 
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pr-10"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Button type="submit" variant="outline">
        <Search className="w-4 h-4 mr-2" />
        Search
      </Button>
    </form>
  );
};