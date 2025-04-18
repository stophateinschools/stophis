
import React from 'react';
import { format } from "date-fns";
import { 
  CalendarClock, 
  CircleAlert, 
  MessageSquare, 
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TimelineEvent } from './types';

interface TimelineViewProps {
  events: TimelineEvent[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  const getIconForEventType = (type: string) => {
    switch (type) {
      case 'incident':
        return <CircleAlert className="h-5 w-5 text-red-500" />;
      case 'report':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'response':
        return <Clock className="h-5 w-5 text-green-500" />;
      default:
        return <CalendarClock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getSentimentBadgeColor = (sentiment?: number) => {
    if (!sentiment) return "bg-gray-100 text-gray-700";
    
    switch (sentiment) {
      case 1: return "bg-red-100 text-red-800";
      case 2: return "bg-orange-100 text-orange-800";
      case 3: return "bg-yellow-100 text-yellow-800";
      case 4: return "bg-lime-100 text-lime-800";
      case 5: return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Incident Timeline</h3>
      
      {events.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CalendarClock className="h-10 w-10 mx-auto opacity-30 mb-2" />
          <p>No timeline events available.</p>
          <p className="text-sm">Add dates to the incident, reports, or responses to see them here.</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
          
          {events.map((event, index) => (
            <div key={event.id} className={cn(
              "relative pl-16",
              index !== events.length - 1 ? "pb-8" : ""
            )}>
              {/* Circle marker */}
              <div className="absolute left-[19px] flex items-center justify-center w-6 h-6 bg-white rounded-full border border-muted">
                {getIconForEventType(event.type)}
              </div>
              
              <div className="p-4 bg-muted/20 rounded-lg border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{event.title}</span>
                  {event.date && (
                    <span className="text-sm text-muted-foreground">{format(event.date, 'MMM d, yyyy')}</span>
                  )}
                </div>
                
                {event.source && (
                  <div className="text-sm mb-1.5">{event.source}</div>
                )}
                
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
                
                {event.sentiment && (
                  <div className="mt-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      getSentimentBadgeColor(event.sentiment)
                    )}>
                      Response Rating: {event.sentiment}/5
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineView;
