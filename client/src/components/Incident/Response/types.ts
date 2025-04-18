export interface TimelineEvent {
  id: string;
  date: Date | null;
  type: 'incident' | 'report' | 'response';
  title: string;
  description?: string;
  source?: string;
  sentiment?: number;
}

export interface ReportItemProps {
  index: number;
  report: {
    recipient: string;
    otherRecipient?: string;
    date?: string;
    note?: string;
  };
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

export interface ResponseItemProps {
  index: number;
  response: {
    source: string;
    otherSource?: string;
    date?: string;
    note?: string;
    sentiment?: number;
  };
  onUpdate: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
}
