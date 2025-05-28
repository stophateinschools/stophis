
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import SearchBox from '@/components/Dashboard/SearchBox';
import IncidentSection from '@/components/Dashboard/IncidentSection';
import { useIncidentDashboard } from '@/hooks/useIncidentDashboard';
import { Incident } from '@/lib/types';
import { useIncidentData } from '@/contexts/IncidentContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  
  const userRegions = currentUser?.regions;
  const userOrganization = currentUser?.organization;

  const { incidents } = useIncidentData();
  const filteredIncidents = incidents.filter(incident => incident.owner.organization == userOrganization || userRegions.includes(incident.state));

  const {
    search,
    setSearch,
    sortBy,
    sortDirection,
    handleSort,
    activeIncidents,
    filedIncidents
  } = useIncidentDashboard(filteredIncidents);

  const displayActiveIncidents: Incident[] = activeIncidents;
    
  const displayFiledIncidents: Incident[] = filedIncidents;


  return (
    <div>
      <DashboardHeader 
        title="My Dashboard" 
        regions={userRegions} 
        organization={userOrganization} 
      />
      
      <SearchBox search={search} onSearchChange={setSearch} />

      {/* Active Incidents */}
      <IncidentSection
        title="Active Incidents"
        incidents={displayActiveIncidents}
        sortBy={sortBy}
        sortDirection={sortDirection}
        handleSort={handleSort}
        emptyMessage="No active incidents in your region"
      />

      {/* Filed Incidents */}
      <IncidentSection
        title="Filed Incidents"
        incidents={displayFiledIncidents}
        sortBy={sortBy}
        sortDirection={sortDirection}
        handleSort={handleSort}
        emptyMessage="No filed incidents in your region"
      />
    </div>
  );
}
