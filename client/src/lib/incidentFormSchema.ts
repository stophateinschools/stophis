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

const incidentStatusValues = Object.values(IncidentStatus) as [string, ...string[]];

// TODO Match this to the backend
export const formSchema = z.object({
  year: z.coerce.number().int().min(2000).max(new Date().getFullYear()),
  month: z.array(z.string()).min(1, "At least one month is required"),
  startDay: z.string().optional(),
  endDay: z.string().optional(),
  isSchoolSpecific: z.boolean().default(true),
  school: z.array(z.string()).optional(),
  district: z.array(z.string()).optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  type: z.array(z.string()).min(1, "At least one incident type is required"),
  summary: z.string().min(5, "Summary is required"),
  details: z.string().optional(),
  source: z.enum(["first-person", "not-first-person", "other"]),
  otherSourceType: z.enum(["news", "social-media", "school-communication", "other"]).optional(),
  shareWithJewishOrgs: z.boolean().default(false),
  shareOnWebsite: z.boolean().default(false),
  reporterName: z.string().optional(),
  reporterEmail: z.string().email().optional(),
  reporterPhone: z.string().optional(),
  reportedToSchoolStatus: z.enum(["yes", "no", "unknown"]).default("unknown"),
  reportedToSchoolDate: z.string().optional(),
  reportedToSchoolNote: z.string().optional(),
  reportedToList: z.array(z.object({
    recipient: z.string(),
    otherRecipient: z.string().optional(),
    date: z.string().optional(),
    note: z.string().optional(),
  })).default([]),
  schoolResponseStatus: z.enum(["yes", "no", "unknown"]).default("unknown"),
  schoolResponseDate: z.string().optional(),
  schoolResponseNote: z.string().optional(),
  schoolResponseSentiment: z.coerce.number().min(1).max(5).optional(),
  responses: z.array(z.object({
    source: z.string(),
    otherSource: z.string().optional(),
    date: z.string().optional(),
    note: z.string().optional(),
    sentiment: z.coerce.number().min(1).max(5).optional(),
  })).default([]),
  shareWithOrganizations: z.array(z.string()).default([]),
  organizationAccessLevel: z.enum(["view", "edit"]).default("view"),
  allowOrganizationsEdit: z.boolean().default(false),
  userSharingLevel: z.enum(["none", "summary", "full"]).default("none"),
  allowUserEdit: z.boolean().default(false),
  publishing: z.enum(["none", "limited", "expanded"]).default("none"),
  status: z.enum(["active", "filed"]).default("active"),
});

export type FormValues = z.infer<typeof formSchema>;
