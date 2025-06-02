import { IncidentStatus } from '@/lib/types';
import { z } from 'zod';

export interface ReportToEntry {
  recipientType: string;
  date?: string;
  note?: string;
}

export interface ResponseFormEntry {
  sourceType: string;
  date?: string;
  note?: string;
  sentiment?: number;
}

function zodEnumFromString<T extends Record<string, string>>(enumObj: T) {
  return z.string().refine((val) => Object.keys(enumObj).includes(val), {
    message: 'Invalid enum value',
  }).transform((val) => val as T[keyof T]);
}

export const formSchema = z.object({
  year: z.coerce.number().int().min(2000).max(new Date().getFullYear()),
  month: z.array(z.string()).min(1, "At least one month is required"),
  startDay: z.string().optional(),
  endDay: z.string().optional(),
  isSchoolSpecific: z.boolean().default(true),
  schools: z.array(z.object({ id: z.number(), name: z.string()})),
  districts: z.array(z.object({ id: z.number(), name: z.string()})),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  types: z.array(z.string()).min(1, "At least one incident type is required"),
  summary: z.string().min(5, "Summary is required"),
  details: z.string().optional(),
  sourceType: z.string().optional(),
  otherSource: z.string().optional(),
  links: z.array(z.string()).optional(),
  documents: z.array(z.object({name: z.string(), url: z.string()})).optional(),
  schoolReportStatus: z.enum(["yes", "no", "unknown"]).default("unknown"),
  reports: z.array(z.object({
    id: z.number().optional(),
    recipientType: z.string(),
    note: z.string().optional().nullable(),
    date: z.string().optional().nullable(),
  })).default([]),
  schoolResponseStatus: z.enum(["yes", "no", "unknown"]).default("unknown"),
  responses: z.array(z.object({
    id: z.number().optional(),
    sourceType: z.string(),
    note: z.string().optional().nullable(),
    date: z.string().optional().nullable(),
    sentiment: z.coerce.number().min(1).max(5).optional().nullable(),
  })).default([]),
  shareOrganizationStatus: z.boolean().default(false),
  shareOrganizations: z.array(z.string()).default([]),
  shareStatus: z.enum(["Private", "Share"]).default("Private"),
  publishStatus: z.enum(["Full Details", "Limited Details", "Hide Details"]).default("Hide Details"),
  status: z.enum(["Filed", "Active"]).default("Active"),
});

export type FormValues = z.infer<typeof formSchema>;
