
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBoxProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const SearchBox = ({ search, onSearchChange }: SearchBoxProps) => {
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search incidents..."
            className="pl-8"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchBox;
