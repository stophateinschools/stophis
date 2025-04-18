
import React from 'react';
import { TableHead } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SortableHeaderProps {
  column: string;
  label: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
}

const SortableHeader = ({ column, label, sortBy, sortDirection, onSort }: SortableHeaderProps) => {
  return (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50" 
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy === column && (
          sortDirection === 'asc' ? 
          <ArrowUp className="h-3 w-3" /> : 
          <ArrowDown className="h-3 w-3" />
        )}
      </div>
    </TableHead>
  );
};

export default SortableHeader;
