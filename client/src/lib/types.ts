
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  organization: string;
  regions: string[] | undefined;
  roles: string[];
}

export interface DiscussionComment {
  id: string;
  author: User;
  createdOn: string;
  note: string;
  updatedOn?: string;
}

export interface ReportEntry {
  recipientType: string;
  date?: string;
  note?: string;
}

export interface ResponseEntry {
  sourceType: string;
  date?: string;
  note?: string;
  sentiment?: number;
}

export enum IncidentStatus {
  ACTIVE = 'Active',
  FILED = 'Filed',
}

export enum IncidentSourceType {
  COMMUNITY_MEMBER = 'Community Member',
  JEWISH_ORGANIZATION = 'Another Jewish Organization',
  NEWS_MEDIA = 'News Media',
  PARENT = 'Parent',
  TEACHER = 'Teacher',
  LAW_ENFORCEMENT = 'Law Enforcement',
  OTHER = 'Other',
}

export interface OccurredOnDate {
  year: number;
  month: [number, number?];
  day: [number, number?];
}

export interface Incident {
  id: string;
  summary: string;  
  details: string;
  date: OccurredOnDate;
  createdOn: string;
  updatedOn: string;
  schools?: {
    id: string;
    name: string;
  }[];
  districts?:{
    id: string;
    name: string;
  }[];
  unions?: Union
  city: string;
  state: string;
  types: string[];
  links: string[];
  documents: Partial<IncidentDocument>[];
  sourceTypes: string[];
  otherSource?: string;
  attributions?: string[];
  owner: User;
  schoolReport: {
    status?: boolean;
    reports?: ReportEntry[];
  };
  schoolResponse: {
    status?: boolean;
    responses?: ResponseEntry[];
  };
  status: IncidentStatus;
  discussion: DiscussionComment[];
  sharingDetails?: {
    organizations: string[];
    status: string;
  };
  publishDetails: {
    privacy: string;
  }
}

export interface IncidentDocument {
  id: string;
  name: string;
  url: string;
  private: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  incidentId: string;
  action: 'create' | 'update' | 'delete';
  details: string;
}

export interface Organization {
  id: string;
  name: string;
}

export enum SchoolLevel {
  ELEMENTARY = "Elementary",
  HIGH = "High",
  MIDDLE = "Middle",
  K8 = "K-8",
  K12 = "K-12",
  PRE = "Pre"
}

export interface School {
  id: string;
  name: string;
  level: SchoolLevel;
  street: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
}

export interface District {
  id: string;
  name: string;
  logo?: string;
  state: string;
}

export interface Union {
  id: string;
  name: string;
  state: string;
}

export type Region = {
  state: string;
} | {
  metro: string;
  state: string;
};

export interface TermsOfService {
  accepted: boolean;
  version: string;
  acceptedDate: string;
}

export enum USState {
  AL = "Alabama",
  AK = "Alaska",
  AZ = "Arizona",
  AR = "Arkansas",
  CA = "California",
  CO = "Colorado",
  CT = "Connecticut",
  DE = "Delaware",
  FL = "Florida",
  GA = "Georgia",
  HI = "Hawaii",
  ID = "Idaho",
  IL = "Illinois",
  IN = "Indiana",
  IA = "Iowa",
  KS = "Kansas",
  KY = "Kentucky",
  LA = "Louisiana",
  ME = "Maine",
  MD = "Maryland",
  MA = "Massachusetts",
  MI = "Michigan",
  MN = "Minnesota",
  MS = "Mississippi",
  MO = "Missouri",
  MT = "Montana",
  NE = "Nebraska",
  NV = "Nevada",
  NH = "New Hampshire",
  NJ = "New Jersey",
  NM = "New Mexico",
  NY = "New York",
  NC = "North Carolina",
  ND = "North Dakota",
  OH = "Ohio",
  OK = "Oklahoma",
  OR = "Oregon",
  PA = "Pennsylvania",
  RI = "Rhode Island",
  SC = "South Carolina",
  SD = "South Dakota",
  TN = "Tennessee",
  TX = "Texas",
  UT = "Utah",
  VT = "Vermont",
  VA = "Virginia",
  WA = "Washington",
  WV = "West Virginia",
  WI = "Wisconsin",
  WY = "Wyoming",
  DC = "District of Columbia",
}
