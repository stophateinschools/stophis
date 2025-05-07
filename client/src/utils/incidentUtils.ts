
import { Incident } from '@/lib/types';
import { formatIncidentDate } from '@/utils/dateFormatters';
import { useAuth } from '@/contexts/AuthContext';

// Get formatted date
export const getFormattedDate = (incident: Incident) => {
  return formatIncidentDate(incident);
};

// Determine if current user can view incident details
export const useIncidentAccess = () => {
  const { currentUser } = useAuth();
  
  const canViewIncident = (incident: Incident) => {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    if (incident.owner.id === currentUser.id) return true;
    if (incident.owner.organization === currentUser.organization) return true;
    
    // Check sharing settings
    if (currentUser.organization && incident.sharing.organizations.includes(currentUser.organization)) {
      return true;
    }
    
    if (currentUser.regions?.includes(incident.state) && incident.sharing.region) {
      return true;
    }
    
    if (incident.sharing.otherRegions) {
      return true;
    }
    
    // Special case for sample view-only incident
    if (incident.id === 'sample-view-only-1') {
      return true;
    }
    
    return false;
  };

  // New function to determine if current user can edit incident
  const canEditIncident = (incident: Incident) => {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    if (incident.owner.id === currentUser.id) return true;
    
    // Users from same organization as owner can edit
    if (incident.owner.organization === currentUser.organization) {
      return true;
    }
    
    // Check if user's organization has edit permission
    if (currentUser.organization && 
        incident.sharing.organizations.includes(currentUser.organization) && 
        incident.sharing.allowOrganizationsEdit) {
      return true;
    }
    
    // Check if user's region has edit permission
    if (currentUser.regions.includes(incident.state) && 
        incident.sharing.region && 
        incident.sharing.allowRegionEdit) {
      return true;
    }
    
    // Sample view-only incident is explicitly not editable
    if (incident.id === 'sample-view-only-1') {
      return false;
    }
    
    return false;
  };

  // Determine access level (restricted, view-only, or full-access)
  const getAccessLevel = (incident: Incident) => {
    if (!canViewIncident(incident)) return 'restricted';
    if (!canEditIncident(incident)) return 'view-only';
    return 'full-access';
  };

  return { canViewIncident, canEditIncident, getAccessLevel };
};
