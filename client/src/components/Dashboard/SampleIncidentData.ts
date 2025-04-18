
import { Incident } from '@/lib/types';

export const getSampleRestrictedIncident = (): Incident => ({
  id: 'sample-restricted-1',
  date: {
    year: 2024,
    month: [4],
    day: [1]
  },
  city: 'Sample City',
  state: 'Sample State',
  school: ['Sample High School'],
  district: ['Sample School District'],
  summary: 'Restricted Incident: Access Denied',
  details: 'Details of this incident are restricted.',
  type: ['Bullying'],
  sourceTypes: 'first-person',
  owner: {
    id: 'restricted-owner@example.com',
    name: 'Restricted Owner',
    organization: 'Sample Org'
  },
  sharing: {
    organizations: [],
    region: false,
    otherRegions: false,
    allowOrganizationsEdit: false,
    allowRegionEdit: false
  },
  publishing: 'none',
  reportedToSchool: {
    status: 'unknown'
  },
  schoolResponse: {
    status: 'unknown'
  },
  discussion: [],
  links: [],
  documents: [],
  status: 'active',
  lastUpdated: new Date().toISOString()
});

export const getSampleViewOnlyIncident = (): Incident => ({
  id: 'sample-view-only-1',
  date: {
    year: 2024,
    month: [4],
    day: [15]
  },
  city: 'Seattle',
  state: 'Washington',
  school: ['Lincoln High School'],
  district: ['Eastside School District'],
  summary: 'Antisemitic graffiti found in school bathroom',
  details: 'Multiple antisemitic symbols and slurs were discovered in the second-floor bathroom. School administrators were immediately notified and documentation was provided.',
  type: ['Harassment', 'Vandalism'],
  sourceTypes: 'not-first-person',
  owner: {
    id: 'view-only-owner@example.com',
    name: 'View Only Owner',
    organization: 'Stop Hate In Schools'
  },
  sharing: {
    organizations: ['Stop Hate In Schools'],
    region: true,
    otherRegions: false,
    allowOrganizationsEdit: false,
    allowRegionEdit: false
  },
  publishing: 'limited',
  reportedToSchool: {
    status: 'yes'
  },
  schoolResponse: {
    status: 'yes'
  },
  discussion: [
    {
      id: 'sample-comment-1',
      userId: 'sample-admin',
      userName: 'Admin User',
      userPhotoURL: '',
      createdOn: '2024-04-15T10:30:00Z',
      note: 'This incident requires further investigation.',
      edited: false
    },
    {
      id: 'sample-comment-2',
      userId: 'sample-reporter',
      userName: 'Incident Reporter',
      userPhotoURL: '',
      createdOn: '2024-04-15T11:45:00Z',
      note: 'Additional context can be provided upon request.',
      edited: false
    },
    {
      id: 'sample-comment-3',
      userId: 'view-only-owner',
      userName: 'View Only Owner',
      userPhotoURL: '',
      createdOn: '2024-04-15T13:20:00Z',
      note: 'I\'ve reached out to the school administration for more information. Will update when I hear back.',
      edited: false
    },
    {
      id: 'sample-comment-4',
      userId: 'sample-coordinator',
      userName: 'Regional Coordinator',
      userPhotoURL: '',
      createdOn: '2024-04-16T09:15:00Z',
      note: 'Our team is monitoring this situation. Please keep us updated with any developments.',
      edited: false
    },
    {
      id: 'sample-comment-5',
      userId: 'view-only-owner',
      userName: 'View Only Owner',
      userPhotoURL: '',
      createdOn: '2024-04-16T14:30:00Z',
      note: 'Update: School administrators have acknowledged the incident and are implementing their response protocol. They\'ll provide a formal response by the end of the week.',
      edited: true,
      updatedOn: '2024-04-16T14:45:00Z'
    }
  ],
  links: [],
  documents: [],
  status: 'active',
  lastUpdated: new Date().toISOString()
});

export const getSampleActiveIncident = (): Incident => ({
  id: 'sample-active-1',
  date: {
    year: 2024,
    month: [4],
    day: [10]
  },
  city: 'Seattle',
  state: 'Washington',
  school: ['Washington High School'],
  district: ['Seattle School District'],
  summary: 'Sample Active Incident',
  details: 'This is a sample active incident for demonstration purposes.',
  type: ['Bullying'],
  sourceTypes: 'first-person',
  owner: {
    id: 'sample-owner@example.com',
    name: 'Sample Owner',
    organization: 'Stop Hate In Schools'
  },
  sharing: {
    organizations: ['Stop Hate In Schools'],
    region: true,
    otherRegions: false,
    allowOrganizationsEdit: false,
    allowRegionEdit: false
  },
  publishing: 'none',
  reportedToSchool: {
    status: 'yes'
  },
  schoolResponse: {
    status: 'unknown'
  },
  discussion: [],
  status: 'active',
  lastUpdated: new Date().toISOString(),
  links: [],
  documents: []
});

export const getSampleFiledIncident = (): Incident => ({
  id: 'sample-filed-1',
  date: {
    year: 2024,
    month: [3],
    day: [15]
  },
  city: 'Bellevue',
  state: 'Washington',
  school: ['Bellevue High School'],
  district: ['Bellevue School District'],
  summary: 'Sample Filed Incident',
  details: 'This is a sample filed incident that has been completed.',
  type: ['Harassment'],
  sourceTypes: 'not-first-person',
  owner: {
    id: 'sample-owner@example.com',
    name: 'Sample Owner',
    organization: 'Stop Hate In Schools'
  },
  sharing: {
    organizations: ['Stop Hate In Schools'],
    region: true,
    otherRegions: false,
    allowOrganizationsEdit: false,
    allowRegionEdit: false
  },
  publishing: 'none',
  reportedToSchool: {
    status: 'yes'
  },
  schoolResponse: {
    status: 'yes'
  },
  discussion: [],
  status: 'filed',
  lastUpdated: new Date().toISOString(),
  links: [],
  documents: []
});
