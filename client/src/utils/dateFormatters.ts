
import { Incident } from '@/lib/types';

/**
 * Formats an incident date object into a readable string
 */
export const formatIncidentDate = (incident: Incident): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  if (!incident?.date?.month) return '';
  
  const monthStr = months[incident.date.month[0] - 1] || '' ;
  const dayStr = incident.date.day ? incident.date.day[0] : '';
  const yearStr = incident.date.year || '';
  if (monthStr && dayStr) {
    return `${monthStr} ${dayStr}, ${yearStr}`;
  } else if (monthStr) {
    return `${monthStr}, ${yearStr}`;
  } else if (yearStr) {
    return `${yearStr}`;
  } else {
    return ""; // or "Unknown Date"
  }
};
