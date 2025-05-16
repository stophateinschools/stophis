import { IncidentStatus } from '@/lib/types';
import { z } from 'zod';

export interface ReportToEntry {
  recipient: string;
  otherRecipient?: string;
  date?: string;
  note?: string;
}

export interface ResponseFormEntry {
  source: string;
  otherSource?: string;
  date?: string;
  note?: string;
  sentiment?: number;
}

function zodEnumFromString<T extends Record<string, string>>(enumObj: T) {
  return z.string().refine((val) => Object.keys(enumObj).includes(val), {
    message: 'Invalid enum value',
  }).transform((val) => val as T[keyof T]);
}

// TODO Match this to the backend
export const formSchema = z.object({
  year: z.coerce.number().int().min(2000).max(new Date().getFullYear()),
  month: z.array(z.string()).min(1, "At least one month is required"),
  startDay: z.string().optional(),
  endDay: z.string().optional(),
  isSchoolSpecific: z.boolean().default(true),
  schools: z.array(z.string()).optional(),
  districts: z.array(z.string()).optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  types: z.array(z.string()).min(1, "At least one incident type is required"),
  summary: z.string().min(5, "Summary is required"),
  details: z.string().optional(),
  sourceType: z.string().optional(),
  otherSource: z.string().optional(),
  links: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  // reportedToSchoolStatus: z.enum(["yes", "no", "unknown"]).default("unknown"),
  // reportedToSchoolDate: z.string().optional(),
  // reportedToSchoolNote: z.string().optional(),
  // reportedToList: z.array(z.object({
  //   recipient: z.string(),
  //   otherRecipient: z.string().optional(),
  //   date: z.string().optional(),
  //   note: z.string().optional(),
  // })).default([]),
  // schoolResponseStatus: z.enum(["yes", "no", "unknown"]).default("unknown"),
  // schoolResponseDate: z.string().optional(),
  // schoolResponseNote: z.string().optional(),
  // schoolResponseSentiment: z.coerce.number().min(1).max(5).optional(),
  // responses: z.array(z.object({
  //   source: z.string(),
  //   otherSource: z.string().optional(),
  //   date: z.string().optional(),
  //   note: z.string().optional(),
  //   sentiment: z.coerce.number().min(1).max(5).optional(),
  // })).default([]),
  shareOrganizationStatus: z.boolean().default(false),
  shareOrganizations: z.array(z.string()).default([]),
  shareStatus: z.enum(["Private", "Share"]).default("Private"),
  publishStatus: z.enum(["Full Details", "Limited Details", "Hide Details"]).default("Hide Details"),
  status: zodEnumFromString(IncidentStatus).default("ACTIVE"),
});

export type FormValues = z.infer<typeof formSchema>;
