import React, { createContext, useState, useContext, useEffect } from 'react';
import { Incident, User, AuditLogEntry, Organization, School, District, DiscussionComment, IncidentDocument } from '@/lib/types';

// Mock data for development purposes
const MOCK_INCIDENTS: Incident[] = [
  {
    id: "incident1",
    date: {
      year: 2024,
      month: [3],
      day: [15],
    },
    school: ["Lincoln High School"],
    city: "Portland",
    state: "Oregon",
    type: ["Anti-Semitism"],
    summary: "Anti-Semitic graffiti found on bathroom wall",
    details: "Students reported finding swastikas and anti-Jewish slurs written on a bathroom wall. School administration was immediately notified and acted quickly to document and remove the graffiti.",
    links: ["https://example.com/policy"],
    documents: [
      {
        id: "doc1",
        name: "Incident Report Form.pdf",
        url: "/documents/incident-report.pdf",
        privacy: "do-not-publish"
      },
      {
        id: "doc2",
        name: "School Response Documentation.pdf",
        url: "/documents/school-response.pdf",
        privacy: "ok-to-share"
      }
    ],
    sourceTypes: "not-first-person",
    reporterInfo: {
      name: "David Cohen",
      email: "david@example.com",
      phone: "555-123-4567",
    },
    reportedToSchool: {
      status: "yes",
      date: "2024-03-15",
      note: "Reported to Principal Johnson",
    },
    schoolResponse: {
      status: "yes",
      date: "2024-03-16",
      note: "Graffiti was removed and an investigation was launched. School held an assembly on hate speech awareness.",
      sentiment: 4,
      ratings: [{ userId: "user1", rating: 4 }],
    },
    sharing: {
      organizations: ["org3"],
      allowOrganizationsEdit: true,
      region: true,
      allowRegionEdit: false,
      otherRegions: false,
    },
    publishing: "limited",
    owner: {
      id: "user1",
      name: "Josh R.",
      organization: "Stop Hate in Schools",
    },
    status: "active",
    lastUpdated: "2024-03-18T12:34:56Z",
    discussion: [
      {
        id: "comment1",
        userId: "user1",
        userName: "Josh R.",
        userPhotoURL: "https://i.pravatar.cc/150?u=demo@example.com",
        createdOn: "2024-03-18T12:34:56Z",
        note: "Following up with the school administration next week.",
      },
      {
        id: "comment2",
        userId: "user2",
        userName: "Jenny K.",
        userPhotoURL: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZmVtYWxlJTIwaGVhZHNob3R8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
        createdOn: "2024-03-19T09:15:30Z",
        note: "Connected the school with ADL resources for addressing anti-Semitism.",
      }
    ],
    isNew: true,
  },
  {
    id: "incident2",
    date: {
      year: 2024,
      month: [2],
      day: [5],
    },
    district: ["Portland Public Schools"],
    city: "Portland",
    state: "Oregon",
    type: ["Anti-Semitism", "Biased, False or Misleading Curriculum"],
    summary: "Concerns raised about history curriculum containing anti-Semitic tropes",
    details: "Parents reported that a supplementary history textbook used in 10th grade contains several historically inaccurate and biased representations of Jewish people that perpetuate harmful stereotypes.",
    links: ["https://example.com/news", "https://example.com/board-meeting"],
    documents: [],
    sourceTypes: "not-first-person",
    reportedToSchool: {
      status: "yes",
      date: "2024-02-10",
      note: "Formal complaint submitted to curriculum committee",
    },
    schoolResponse: {
      status: "yes",
      date: "2024-02-15",
      note: "District curriculum committee agreed to review the materials and consult with subject matter experts",
      sentiment: 3,
      ratings: [{ userId: "user2", rating: 3 }],
    },
    sharing: {
      organizations: ["org2", "org3"],
      allowOrganizationsEdit: false,
      region: true,
      allowRegionEdit: false,
      otherRegions: true,
    },
    publishing: "limited",
    owner: {
      id: "user2",
      name: "Jenny K.",
      organization: "Education Justice Coalition",
    },
    status: "active",
    lastUpdated: "2024-02-20T15:22:43Z",
    discussion: [
      {
        id: "comment3",
        userId: "user2",
        userName: "Jenny K.",
        userPhotoURL: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZmVtYWxlJTIwaGVhZHNob3R8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
        createdOn: "2024-02-20T15:22:43Z",
        note: "Arranged for curriculum expert from Jewish Federation to review materials and provide recommendations.",
      }
    ],
    isUpdated: true,
  },
  {
    id: "incident3",
    date: {
      year: 2024,
      month: [4],
      day: [2],
    },
    school: ["Jefferson Middle School"],
    city: "Portland",
    state: "Oregon",
    type: ["Anti-Semitism", "Bullying or Harassment"],
    summary: "Jewish student targeted with repeated anti-Semitic comments and exclusion",
    details: "A 7th grade student has been subjected to repeated anti-Semitic comments, jokes, and exclusion from social activities by a group of classmates over the past month.",
    links: [],
    documents: [],
    sourceTypes: "first-person",
    reporterInfo: {
      name: "Sarah Goldstein",
      email: "sarah@example.com",
      phone: "555-987-6543",
    },
    reportedToSchool: {
      status: "yes",
      date: "2024-04-03",
      note: "Reported to Vice Principal Williams and school counselor",
    },
    schoolResponse: {
      status: "yes",
      date: "2024-04-04",
      note: "School counselor is holding individual and group sessions; parents of involved students contacted",
      sentiment: 4,
      ratings: [{ userId: "user1", rating: 4 }],
    },
    sharing: {
      organizations: ["org2", "org3"],
      allowOrganizationsEdit: true,
      region: true,
      allowRegionEdit: true,
      otherRegions: false,
    },
    publishing: "none",
    owner: {
      id: "user1",
      name: "Josh R.",
      organization: "Stop Hate in Schools",
    },
    status: "active",
    lastUpdated: "2024-04-05T09:45:23Z",
    discussion: [
      {
        id: "comment4",
        userId: "user1",
        userName: "Josh R.",
        userPhotoURL: "https://i.pravatar.cc/150?u=demo@example.com",
        createdOn: "2024-04-05T09:45:23Z",
        note: "Connecting family with support resources through Jewish Student Union.",
      }
    ],
    isUpdated: false,
  },
  {
    id: "incident4",
    date: {
      year: 2024,
      month: [1],
      day: [25],
    },
    school: ["Washington Elementary"],
    city: "Portland",
    state: "Oregon",
    type: ["Anti-Semitism", "Social Media"],
    summary: "Anti-Semitic content shared in student group chat",
    details: "Parents discovered a group chat where 5th grade students were sharing anti-Semitic memes and jokes. Some students reported feeling uncomfortable but were afraid to speak up.",
    links: [],
    documents: [
      {
        id: "doc2",
        name: "Screenshots.pdf",
        url: "/documents/screenshots.pdf",
        privacy: "do-not-publish"
      }
    ],
    sourceTypes: "not-first-person",
    reporterInfo: {
      name: "Michael Levy",
      email: "michael@example.com",
      phone: "555-222-3333",
    },
    reportedToSchool: {
      status: "yes",
      date: "2024-01-26",
      note: "Reported to classroom teacher and principal",
    },
    schoolResponse: {
      status: "yes",
      date: "2024-01-29",
      note: "Digital citizenship assembly scheduled; parents notified; individual interventions with students who shared content",
      sentiment: 5,
      ratings: [{ userId: "user2", rating: 5 }],
    },
    sharing: {
      organizations: ["org2", "org3"],
      allowOrganizationsEdit: false,
      region: true,
      allowRegionEdit: false,
      otherRegions: false,
    },
    publishing: "limited",
    owner: {
      id: "user2",
      name: "Jenny K.",
      organization: "Education Justice Coalition",
    },
    status: "active",
    lastUpdated: "2024-02-05T14:12:37Z",
    discussion: [
      {
        id: "comment5",
        userId: "user2",
        userName: "Jenny K.",
        userPhotoURL: "https://i.pravatar.cc/150?u=jane@example.com",
        createdOn: "2024-02-05T14:12:37Z",
        note: "ADL is providing educational resources for teachers to use in classroom discussions.",
      }
    ],
    isNew: false,
  },
  {
    id: "incident5",
    date: {
      year: 2024,
      month: [3],
      day: [5],
    },
    district: ["Beaverton School District"],
    city: "Beaverton",
    state: "Oregon",
    type: ["Anti-Semitism", "Social Media"],
    summary: "Anti-Semitic graffiti found in high school bathroom",
    details: "Swastikas and anti-Semitic slurs were discovered in the boys' bathroom at Southridge High. The incident was documented by students and shared on social media before school maintenance removed it.",
    links: ["https://example.com/local-news-coverage"],
    documents: [],
    sourceTypes: "other",
    reportedToSchool: {
      status: "yes",
      date: "2024-03-05",
      note: "Discovered and reported by custodial staff",
    },
    schoolResponse: {
      status: "yes",
      date: "2024-03-05",
      note: "Immediate removal, investigation launched, school-wide assembly on hate speech scheduled",
      sentiment: 5,
      ratings: [{ userId: "user1", rating: 5 }],
    },
    sharing: {
      organizations: ["org1", "org2", "org3"],
      allowOrganizationsEdit: true,
      region: true,
      allowRegionEdit: true,
      otherRegions: true,
    },
    publishing: "expanded",
    owner: {
      id: "user1",
      name: "Josh R.",
      organization: "Stop Hate in Schools",
    },
    status: "active",
    lastUpdated: "2024-03-08T11:30:15Z",
    discussion: [
      {
        id: "comment6",
        userId: "user3",
        userName: "John Doe",
        userPhotoURL: "https://i.pravatar.cc/150?u=john@example.com",
        createdOn: "2024-03-06T10:22:45Z",
        note: "Local Jewish community leaders have offered to speak at the school assembly.",
      },
      {
        id: "comment7",
        userId: "user1",
        userName: "Josh R.",
        userPhotoURL: "https://i.pravatar.cc/150?u=demo@example.com",
        createdOn: "2024-03-08T11:30:15Z",
        note: "District has approved additional security cameras in common areas.",
      }
    ],
    isNew: true,
  },
  {
    id: "incident6",
    date: {
      year: 2023,
      month: [12],
      day: [8],
    },
    school: ["Lincoln High School"],
    city: "Portland",
    state: "Oregon",
    type: ["Anti-Semitism", "Vandalism"],
    summary: "Jewish student's locker vandalized with anti-Semitic symbols",
    details: "A student arrived at school to find their locker vandalized with anti-Semitic symbols and slurs. The student was specifically targeted as they are known to be Jewish.",
    links: [],
    documents: [],
    sourceTypes: "first-person",
    reporterInfo: {
      name: "Rebecca Stein",
      email: "rebecca@example.com",
      phone: "555-765-4321",
    },
    reportedToSchool: {
      status: "yes",
      date: "2023-12-08",
      note: "Reported to principal and school security",
    },
    schoolResponse: {
      status: "yes",
      date: "2023-12-08",
      note: "Security footage reviewed, investigation ongoing, counseling offered to affected student",
      sentiment: 4,
      ratings: [{ userId: "user2", rating: 4 }],
    },
    sharing: {
      organizations: ["org2", "org3"],
      allowOrganizationsEdit: false,
      region: true,
      allowRegionEdit: false,
      otherRegions: false,
    },
    publishing: "limited",
    owner: {
      id: "user2",
      name: "Jenny K.",
      organization: "Education Justice Coalition",
    },
    status: "filed",
    lastUpdated: "2024-01-10T08:20:11Z",
    discussion: [
      {
        id: "comment8",
        userId: "user2",
        userName: "Jenny K.",
        userPhotoURL: "https://i.pravatar.cc/150?u=jane@example.com",
        createdOn: "2024-01-10T08:20:11Z",
        note: "Case resolved, student responsible identified and appropriate disciplinary action taken.",
      }
    ],
    isUpdated: false,
  },
  {
    id: "incident7",
    date: {
      year: 2023,
      month: [11],
      day: [22],
    },
    district: ["Portland Public Schools"],
    city: "Portland",
    state: "Oregon",
    type: ["Anti-Semitism", "Religious Accommodation"],
    summary: "Student denied accommodation for religious holiday observance",
    details: "A high school student was denied reasonable accommodation for missing school during Yom Kippur, resulting in academic penalties despite advance notice to teachers.",
    links: ["https://example.com/district-policy"],
    documents: [
      {
        id: "doc3",
        name: "Email Correspondence.pdf",
        url: "/documents/email-correspondence.pdf",
        privacy: "do-not-publish"
      }
    ],
    sourceTypes: "first-person",
    reporterInfo: {
      name: "Daniel Shapiro",
      email: "daniel@example.com",
      phone: "555-888-9999",
    },
    reportedToSchool: {
      status: "yes",
      date: "2023-11-25",
      note: "Met with principal and department head",
    },
    schoolResponse: {
      status: "yes",
      date: "2023-11-28",
      note: "School reviewed religious accommodation policy with staff; student allowed to make up work without penalty",
      sentiment: 3,
      ratings: [{ userId: "user1", rating: 3 }],
    },
    sharing: {
      organizations: ["org3"],
      allowOrganizationsEdit: true,
      region: true,
      allowRegionEdit: true,
      otherRegions: false,
    },
    publishing: "limited",
    owner: {
      id: "user1",
      name: "Josh R.",
      organization: "Stop Hate in Schools",
    },
    status: "filed",
    lastUpdated: "2023-12-15T16:45:22Z",
    discussion: [
      {
        id: "comment9",
        userId: "user1",
        userName: "Josh R.",
        userPhotoURL: "https://i.pravatar.cc/150?u=demo@example.com",
        createdOn: "2023-12-15T16:45:22Z",
        note: "District has agreed to provide additional training on religious accommodations for all staff.",
      }
    ],
    isUpdated: false,
  }
];

const MOCK_ORGANIZATIONS: Organization[] = [
  { id: "org1", name: "Stop Hate in Schools" },
  { id: "org2", name: "Anti Defamation League" },
  { id: "org3", name: "Jewish Federation" }
];

const MOCK_SCHOOLS: School[] = [
  { id: "school1", name: "Lincoln High School", district: "Portland Public Schools", level: "high", address: "123 Main St", city: "Portland", state: "Oregon" },
  { id: "school2", name: "Jefferson Middle School", district: "Portland Public Schools", level: "middle", address: "456 Oak Ave", city: "Portland", state: "Oregon" },
  { id: "school3", name: "Washington Elementary", district: "Portland Public Schools", level: "elementary", address: "789 Pine Blvd", city: "Portland", state: "Oregon" }
];

const MOCK_DISTRICTS: District[] = [
  { id: "district1", name: "Portland Public Schools", city: "Portland", state: "Oregon" },
  { id: "district2", name: "Beaverton School District", city: "Beaverton", state: "Oregon" },
  { id: "district3", name: "Seattle Public Schools", city: "Seattle", state: "Washington" }
];

const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "log1",
    timestamp: "2023-12-01T12:34:56Z",
    userId: "user1",
    userName: "Josh R.",
    incidentId: "incident1",
    action: "create",
    details: "Created new incident report"
  },
  {
    id: "log2",
    timestamp: "2023-12-02T09:15:30Z",
    userId: "user2",
    userName: "Jenny K.",
    incidentId: "incident1",
    action: "update",
    details: "Updated school response information"
  },
  {
    id: "log3",
    timestamp: "2023-11-10T15:22:43Z",
    userId: "user2",
    userName: "Jenny K.",
    incidentId: "incident2",
    action: "create",
    details: "Created new incident report"
  }
];

const MOCK_USERS: User[] = [
  {
    id: "user1",
    name: "Josh R.",
    email: "demo@example.com",
    profilePicture: "https://i.pravatar.cc/150?u=demo@example.com",
    organization: "Stop Hate in Schools",
    regions: ["Oregon", "Washington"],
    isAdmin: true,
    isArchived: false,
    incidentCount: 5
  },
  {
    id: "user2",
    name: "Jenny K.",
    email: "jane@example.com",
    profilePicture: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZmVtYWxlJTIwaGVhZHNob3R8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
    organization: "Education Justice Coalition",
    regions: ["Oregon"],
    isAdmin: false,
    isArchived: false,
    incidentCount: 3
  },
  {
    id: "user3",
    name: "John Doe",
    email: "john@example.com",
    profilePicture: "https://i.pravatar.cc/150?u=john@example.com",
    organization: "Equity Alliance",
    regions: ["California"],
    isAdmin: false,
    isArchived: true,
    incidentCount: 0
  }
];

interface DataContextType {
  incidents: Incident[];
  users: User[];
  organizations: Organization[];
  schools: School[];
  districts: District[];
  auditLog: AuditLogEntry[];
  getIncidentById: (id: string) => Incident | undefined;
  addIncident: (incident: Omit<Incident, "id" | "lastUpdated">) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  addComment: (incidentId: string, comment: Omit<DiscussionComment, "id">) => void;
  updateComment: (incidentId: string, commentId: string, updates: Partial<DiscussionComment>) => void;
  deleteComment: (incidentId: string, commentId: string) => void;
  archiveUser: (userId: string) => void;
  unarchiveUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [organizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [schools] = useState<School[]>(MOCK_SCHOOLS);
  const [districts] = useState<District[]>(MOCK_DISTRICTS);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOG);

  const getIncidentById = (id: string) => {
    return incidents.find(incident => incident.id === id);
  };

  const addIncident = (incident: Omit<Incident, "id" | "lastUpdated">) => {
    const newIncident: Incident = {
      ...incident,
      id: `incident${incidents.length + 1}`,
      lastUpdated: new Date().toISOString(),
      isNew: true,
    };
    
    setIncidents([newIncident, ...incidents]);
    
    // Add to audit log
    const logEntry: AuditLogEntry = {
      id: `log${auditLog.length + 1}`,
      timestamp: new Date().toISOString(),
      userId: incident.owner.id,
      userName: incident.owner.name,
      incidentId: newIncident.id,
      action: "create",
      details: "Created new incident report"
    };
    
    setAuditLog([logEntry, ...auditLog]);
  };

  const updateIncident = (id: string, updates: Partial<Incident>) => {
    setIncidents(incidents.map(incident => {
      if (incident.id === id) {
        return {
          ...incident,
          ...updates,
          lastUpdated: new Date().toISOString(),
          isUpdated: true
        };
      }
      return incident;
    }));
    
    // Add to audit log
    const logEntry: AuditLogEntry = {
      id: `log${auditLog.length + 1}`,
      timestamp: new Date().toISOString(),
      userId: "user1",
      userName: "Josh R.",
      incidentId: id,
      action: "update",
      details: "Updated incident report"
    };
    
    setAuditLog([logEntry, ...auditLog]);
  };

  const addComment = (incidentId: string, comment: Omit<DiscussionComment, "id">) => {
    setIncidents(incidents.map(incident => {
      if (incident.id === incidentId) {
        const newComment = {
          ...comment,
          id: `comment${incident.discussion.length + 1}`
        };
        
        return {
          ...incident,
          discussion: [newComment, ...incident.discussion],
          lastUpdated: new Date().toISOString()
        };
      }
      return incident;
    }));
  };

  const updateComment = (incidentId: string, commentId: string, updates: Partial<DiscussionComment>) => {
    setIncidents(incidents.map(incident => {
      if (incident.id === incidentId) {
        return {
          ...incident,
          discussion: incident.discussion.map(comment => 
            comment.id === commentId 
              ? { ...comment, ...updates } 
              : comment
          ),
          lastUpdated: new Date().toISOString()
        };
      }
      return incident;
    }));
  };

  const deleteComment = (incidentId: string, commentId: string) => {
    setIncidents(incidents.map(incident => {
      if (incident.id === incidentId) {
        return {
          ...incident,
          discussion: incident.discussion.filter(comment => comment.id !== commentId),
          lastUpdated: new Date().toISOString()
        };
      }
      return incident;
    }));
  };

  const archiveUser = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          isArchived: true
        };
      }
      return user;
    }));
  };

  const unarchiveUser = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          isArchived: false
        };
      }
      return user;
    }));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          ...updates
        };
      }
      return user;
    }));
  };

  const value = {
    incidents,
    users,
    organizations,
    schools,
    districts,
    auditLog,
    getIncidentById,
    addIncident,
    updateIncident,
    addComment,
    updateComment,
    deleteComment,
    archiveUser,
    unarchiveUser,
    updateUser,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
