
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import SearchBox from '@/components/Dashboard/SearchBox';
import IncidentSection from '@/components/Dashboard/IncidentSection';
import { useIncidentDashboard } from '@/hooks/useIncidentDashboard';
import { Incident } from '@/lib/types';
import { useIncidents } from '@/hooks/useIncidents';

export default function Dashboard() {

  console.log("DASHBOARD");
  const { data: incidents, isLoading } = useIncidents();
  const { currentUser } = useAuth();

  console.log("Current user ", currentUser)
  
  // Display Washington as the default region
  const userRegions = currentUser?.regions || ["Washington State"];
  const userOrganization = currentUser?.organization || "Stop Hate in Schools";
  
  const {
    search,
    setSearch,
    sortBy,
    sortDirection,
    handleSort,
    activeIncidents,
    filedIncidents
  } = useIncidentDashboard(isLoading ? [] : incidents);

  if (isLoading) return <div>Loading...</div>

  // Use sample incidents if none are found
  const displayActiveIncidents: Incident[] = activeIncidents;
    
  const displayFiledIncidents: Incident[] = filedIncidents;

  console.log("ACTIVE ", activeIncidents);
  console.log("FILED ", filedIncidents);


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
