
import React from 'react';
import { Button } from '@/components/ui/button';

interface IncidentPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const IncidentPagination: React.FC<IncidentPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center mt-6">
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center">
          <span className="px-3">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default IncidentPagination;
