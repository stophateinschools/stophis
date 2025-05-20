
import { useMemo } from 'react';
import { FormValues } from "@/hooks/useIncidentForm";
import { TimelineEvent } from './types';

export function useTimelineEvents(formValues: FormValues): TimelineEvent[] {
  const events = useMemo(() => {
    const timelineEvents: TimelineEvent[] = [];
    
    // Add incident date
    const year = formValues.year;
    const monthValue = formValues.month[0];
    const months = [
      { value: "1", label: "January" },
      { value: "2", label: "February" },
      { value: "3", label: "March" },
      { value: "4", label: "April" },
      { value: "5", label: "May" },
      { value: "6", label: "June" },
      { value: "7", label: "July" },
      { value: "8", label: "August" },
      { value: "9", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ];
    const monthLabel = months.find(m => m.value === monthValue)?.label || '';
    const startDay = formValues.startDay;
    const endDay = formValues.endDay;
    
    let incidentDate: Date | null = null;
    let incidentDateString = '';
    
    if (startDay) {
      incidentDate = new Date(year, parseInt(monthValue) - 1, parseInt(startDay));
      incidentDateString = `${monthLabel} ${startDay}, ${year}`;
      
      if (endDay) {
        incidentDateString = `${monthLabel} ${startDay}-${endDay}, ${year}`;
      }
    } else {
      incidentDateString = `${monthLabel} ${year}`;
    }
    
    timelineEvents.push({
      id: 'incident',
      date: incidentDate,
      type: 'incident',
      title: 'Incident Occurred',
      description: incidentDateString
    });
    
    // Add report dates
    if (formValues.schoolReportStatus === 'yes' && formValues.reports) {
      formValues.reports.forEach((report, index) => {
        if (report.date) {
          timelineEvents.push({
            id: `report-${index}`,
            date: new Date(report.date),
            type: 'report',
            title: `Reported to ${report.recipient}`,
            description: report.note,
            source: report.recipient,
          });
        }
      });
    }
    
    // Add response dates
    if (formValues.schoolResponseStatus === 'yes' && formValues.responses) {
      formValues.responses.forEach((response, index) => {
        if (response.date) {
          timelineEvents.push({
            id: `response-${index}`,
            date: new Date(response.date),
            type: 'response',
            title: `Response from ${response.source}`,
            description: response.note,
            source: response.source,
            sentiment: response.sentiment
          });
        }
      });
    }
    
    // Sort events by date
    return timelineEvents
      .filter(event => event.date !== null)
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return a.date.getTime() - b.date.getTime();
      });
    
  }, [formValues]);
  
  return events;
}
