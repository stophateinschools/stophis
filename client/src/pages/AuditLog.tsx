
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const AuditLog = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { auditLog, incidents, users, organizations } = useData();
  
  // Redirect non-admin users
  if (!currentUser?.isAdmin) {
    navigate('/dashboard');
    return null;
  }
  
  // State for filtering
  const [search, setSearch] = useState('');
  const [filterField, setFilterField] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  
  // State for sorting
  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  
  // Get unique values for filters
  const incidentOwners = useMemo(() => {
    const uniqueOwners = new Set<string>();
    auditLog.forEach(log => {
      const incident = incidents.find(inc => inc.id === log.incidentId);
      if (incident) {
        uniqueOwners.add(incident.owner.name);
      }
    });
    return Array.from(uniqueOwners);
  }, [auditLog, incidents]);
  
  const incidentOrganizations = useMemo(() => {
    const uniqueOrgs = new Set<string>();
    auditLog.forEach(log => {
      const incident = incidents.find(inc => inc.id === log.incidentId);
      if (incident) {
        uniqueOrgs.add(incident.owner.organization);
      }
    });
    return Array.from(uniqueOrgs);
  }, [auditLog, incidents]);
  
  const incidentSchools = useMemo(() => {
    const uniqueSchools = new Set<string>();
    auditLog.forEach(log => {
      const incident = incidents.find(inc => inc.id === log.incidentId);
      if (incident && incident.school) {
        incident.school.forEach(school => uniqueSchools.add(school));
      }
    });
    return Array.from(uniqueSchools);
  }, [auditLog, incidents]);
  
  const incidentDistricts = useMemo(() => {
    const uniqueDistricts = new Set<string>();
    auditLog.forEach(log => {
      const incident = incidents.find(inc => inc.id === log.incidentId);
      if (incident && incident.district) {
        incident.district.forEach(district => uniqueDistricts.add(district));
      }
    });
    return Array.from(uniqueDistricts);
  }, [auditLog, incidents]);
  
  const incidentStates = useMemo(() => {
    const uniqueStates = new Set<string>();
    auditLog.forEach(log => {
      const incident = incidents.find(inc => inc.id === log.incidentId);
      if (incident) {
        uniqueStates.add(incident.state);
      }
    });
    return Array.from(uniqueStates);
  }, [auditLog, incidents]);
  
  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    let filtered = [...auditLog];
    
    // Apply search if provided
    if (search) {
      const lowercaseSearch = search.toLowerCase();
      filtered = filtered.filter(log => {
        const incident = incidents.find(inc => inc.id === log.incidentId);
        if (!incident) return false;
        
        return (
          log.incidentId.toLowerCase().includes(lowercaseSearch) ||
          log.userId.toLowerCase().includes(lowercaseSearch) ||
          log.userName.toLowerCase().includes(lowercaseSearch) ||
          log.action.toLowerCase().includes(lowercaseSearch) ||
          log.details.toLowerCase().includes(lowercaseSearch) ||
          incident.summary.toLowerCase().includes(lowercaseSearch)
        );
      });
    }
    
    // Apply field-specific filter
    if (filterField && filterValue) {
      filtered = filtered.filter(log => {
        const incident = incidents.find(inc => inc.id === log.incidentId);
        if (!incident) return false;
        
        switch(filterField) {
          case 'owner':
            return incident.owner.name === filterValue;
          case 'organization':
            return incident.owner.organization === filterValue;
          case 'school':
            return incident.school?.includes(filterValue);
          case 'district':
            return incident.district?.includes(filterValue);
          case 'state':
            return incident.state === filterValue;
          case 'incidentId':
            return incident.id === filterValue;
          default:
            return true;
        }
      });
    }
    
    // Sort logs
    return filtered.sort((a, b) => {
      if (sortField === 'timestamp') {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (sortField === 'user') {
        return sortDirection === 'asc' 
          ? a.userName.localeCompare(b.userName)
          : b.userName.localeCompare(a.userName);
      }
      
      return 0;
    });
  }, [auditLog, incidents, search, filterField, filterValue, sortField, sortDirection]);
  
  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Sort handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter options based on the selected filter field
  const getFilterOptions = () => {
    switch(filterField) {
      case 'owner':
        return incidentOwners.map(owner => (
          <SelectItem key={owner} value={owner}>{owner}</SelectItem>
        ));
      case 'organization':
        return incidentOrganizations.map(org => (
          <SelectItem key={org} value={org}>{org}</SelectItem>
        ));
      case 'school':
        return incidentSchools.map(school => (
          <SelectItem key={school} value={school}>{school}</SelectItem>
        ));
      case 'district':
        return incidentDistricts.map(district => (
          <SelectItem key={district} value={district}>{district}</SelectItem>
        ));
      case 'state':
        return incidentStates.map(state => (
          <SelectItem key={state} value={state}>{state}</SelectItem>
        ));
      case 'incidentId':
        return incidents.map(incident => (
          <SelectItem key={incident.id} value={incident.id}>{incident.id}</SelectItem>
        ));
      default:
        return null;
    }
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter by field */}
        <div className="flex gap-2 w-full md:w-2/3">
          <Select value={filterField} onValueChange={setFilterField}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Incident Owner</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="district">District</SelectItem>
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="incidentId">Incident ID</SelectItem>
            </SelectContent>
          </Select>
          
          {filterField && (
            <Select value={filterValue} onValueChange={setFilterValue}>
              <SelectTrigger className="w-full md:w-1/3">
                <SelectValue placeholder="Select value..." />
              </SelectTrigger>
              <SelectContent>
                {getFilterOptions()}
              </SelectContent>
            </Select>
          )}
          
          {filterField && filterValue && (
            <Button 
              variant="outline"
              onClick={() => {
                setFilterField('');
                setFilterValue('');
              }}
            >
              Clear Filter
            </Button>
          )}
        </div>
      </div>
      
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('timestamp')}
              >
                Date/Time
                {sortField === 'timestamp' && (
                  sortDirection === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('user')}
              >
                User
                {sortField === 'user' && (
                  sortDirection === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                )}
              </TableHead>
              <TableHead>Incident ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLogs.length > 0 ? (
              currentLogs.map((log) => {
                const incident = incidents.find(inc => inc.id === log.incidentId);
                
                return (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{formatDate(log.timestamp)}</TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        onClick={() => navigate(`/incidents/${log.incidentId}`)}
                      >
                        {log.incidentId}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <span className={`capitalize ${
                        log.action === 'create' ? 'text-green-600' : 
                        log.action === 'update' ? 'text-blue-600' : 
                        'text-red-600'
                      }`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default AuditLog;
