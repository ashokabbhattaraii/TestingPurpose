import type {
  User,
  ServiceRequest,
  Announcement,
  AnalyticsData,
  LunchToken,
  Notification,
} from "./types";

export const users: User[] = [
  {
    id: "u1",
    name: "Aarav Sharma",
    email: "aarav@rumsan.com",
    avatar: "",
    role: "employee",
    department: "Engineering",
    joinedAt: "2024-06-15",
    status: "active",
    lastLogin: "2026-02-09T08:30:00Z",
    socialAccounts: [
      {
        provider: "google",
        email: "aarav.sharma@gmail.com",
        connectedAt: "2024-07-10T10:00:00Z",
      },
      {
        provider: "github",
        email: "aarav-sharma",
        connectedAt: "2024-09-15T14:30:00Z",
      },
    ],
    notificationPreferences: {
      emailNotifications: true,
      announcements: true,
      assignments: true,
    },
  },
  {
    id: "u2",
    name: "Priya Thapa",
    email: "priya@rumsan.com",
    avatar: "",
    role: "employee",
    department: "Design",
    joinedAt: "2024-08-01",
    status: "active",
    lastLogin: "2026-02-08T15:45:00Z",
    socialAccounts: [
      {
        provider: "linkedin",
        email: "priya-thapa",
        connectedAt: "2024-08-20T09:00:00Z",
      },
    ],
    notificationPreferences: {
      emailNotifications: true,
      announcements: false,
      assignments: true,
    },
  },
  {
    id: "u3",
    name: "Bikash Karki",
    email: "bikash@rumsan.com",
    avatar: "",
    role: "admin",
    department: "Facilities",
    joinedAt: "2023-12-10",
    status: "active",
    lastLogin: "2026-02-09T07:15:00Z",
    socialAccounts: [
      {
        provider: "google",
        email: "bikash.karki@gmail.com",
        connectedAt: "2024-01-15T11:20:00Z",
      },
    ],
    notificationPreferences: {
      emailNotifications: true,
      announcements: true,
      assignments: true,
    },
  },
  {
    id: "u4",
    name: "Sita Poudel",
    email: "sita@rumsan.com",
    avatar: "",
    role: "admin",
    department: "Operations",
    joinedAt: "2024-01-20",
    status: "active",
    lastLogin: "2026-02-09T09:00:00Z",
    socialAccounts: [],
    notificationPreferences: {
      emailNotifications: false,
      announcements: true,
      assignments: true,
    },
  },
  {
    id: "u5",
    name: "Rajesh Hamal",
    email: "rajesh@rumsan.com",
    avatar: "",
    role: "superadmin",
    department: "Management",
    joinedAt: "2023-01-05",
    status: "active",
    lastLogin: "2026-02-08T12:30:00Z",
    socialAccounts: [
      {
        provider: "google",
        email: "rajesh.hamal@gmail.com",
        connectedAt: "2023-02-10T08:30:00Z",
      },
      {
        provider: "github",
        email: "rajesh-hamal",
        connectedAt: "2023-03-20T16:45:00Z",
      },
      {
        provider: "linkedin",
        email: "rajesh-hamal",
        connectedAt: "2023-04-05T13:15:00Z",
      },
    ],
    notificationPreferences: {
      emailNotifications: true,
      announcements: true,
      assignments: true,
    },
  },
];

export const serviceRequests: ServiceRequest[] = [
  {
    id: "SR-001",
    title: "Restock coffee and tea supplies",
    description:
      "The pantry is running low on coffee beans, tea bags, and sugar packets.",
    category: "Food and Supplies",
    status: "pending",
    priority: "medium",
    createdBy: "u1",
    createdByName: "Aarav Sharma",
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "SR-002",
    title: "AC not working in meeting room B",
    description:
      "The air conditioning unit in meeting room B is blowing warm air. Needs servicing.",
    category: "Office Maintenance",
    status: "in-progress",
    priority: "high",
    createdBy: "u2",
    createdByName: "Priya Thapa",
    assignedTo: "u3",
    assignedToName: "Bikash Karki",
    createdAt: "2026-01-28T14:30:00Z",
    updatedAt: "2026-01-30T10:00:00Z",
  },
  {
    id: "SR-003",
    title: "Deep cleaning for 3rd floor",
    description:
      "Requesting a thorough deep cleaning of the 3rd floor workspace area.",
    category: "Other",
    otherCategory: "Deep Cleaning",
    status: "resolved",
    priority: "low",
    createdBy: "u1",
    createdByName: "Aarav Sharma",
    assignedTo: "u4",
    assignedToName: "Sita Poudel",
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-01-25T16:00:00Z",
  },
  {
    id: "SR-004",
    title: "Refill water dispenser on 2nd floor",
    description: "Water dispenser near the engineering bay is empty.",
    category: "Food and Supplies",
    status: "resolved",
    priority: "medium",
    createdBy: "u2",
    createdByName: "Priya Thapa",
    assignedTo: "u3",
    assignedToName: "Bikash Karki",
    createdAt: "2026-01-15T11:00:00Z",
    updatedAt: "2026-01-15T14:00:00Z",
  },
  {
    id: "SR-005",
    title: "Replace broken desk lamp",
    description:
      "The desk lamp at workstation E-12 is flickering and needs replacement.",
    category: "Office Maintenance",
    status: "pending",
    priority: "low",
    createdBy: "u1",
    createdByName: "Aarav Sharma",
    createdAt: "2026-02-03T10:00:00Z",
    updatedAt: "2026-02-03T10:00:00Z",
  },
  {
    id: "SR-006",
    title: "Restock printer paper",
    description: "All printers on the 2nd floor are out of A4 paper.",
    category: "Office Maintenance",
    status: "in-progress",
    priority: "high",
    createdBy: "u2",
    createdByName: "Priya Thapa",
    assignedTo: "u4",
    assignedToName: "Sita Poudel",
    createdAt: "2026-02-05T08:30:00Z",
    updatedAt: "2026-02-06T09:00:00Z",
  },
  {
    id: "SR-007",
    title: "Pest control for kitchen area",
    description:
      "Noticed insects in the office kitchen near the storage cabinets.",
    category: "Cleaning",
    status: "on-hold",
    priority: "high",
    createdBy: "u1",
    createdByName: "Aarav Sharma",
    createdAt: "2026-02-06T15:00:00Z",
    updatedAt: "2026-02-06T15:00:00Z",
  },
  {
    id: "SR-008",
    title: "Request for standing desk",
    description: "Would like a standing desk converter for workstation E-05.",
    category: "Office Maintenance",
    status: "rejected",
    priority: "low",
    createdBy: "u2",
    createdByName: "Priya Thapa",
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-01-12T11:00:00Z",
  },
  {
    id: "SR-009",
    title: "Microwave repair in pantry",
    description:
      "The microwave in the 2nd floor pantry is not heating properly.",
    category: "Other",
    otherCategory: "Appliance Repair",
    status: "in-progress",
    priority: "medium",
    createdBy: "u1",
    createdByName: "Aarav Sharma",
    assignedTo: "u3",
    assignedToName: "Bikash Karki",
    createdAt: "2026-02-04T12:00:00Z",
    updatedAt: "2026-02-05T10:00:00Z",
  },
  {
    id: "SR-010",
    title: "Restock snacks in ",
    description: "The snack shelf in the main pantry has been empty for days.",
    category: "Food and Supplies",
    status: "resolved",
    priority: "low",
    createdBy: "u2",
    createdByName: "Priya Thapa",
    assignedTo: "u4",
    assignedToName: "Sita Poudel",
    createdAt: "2026-01-22T10:00:00Z",
    updatedAt: "2026-01-23T14:00:00Z",
  },
];

export const announcements: Announcement[] = [
  {
    id: "a1",
    title: "Office Deep Cleaning Scheduled",
    content:
      "A full office deep cleaning has been scheduled for Saturday, Feb 8. Please clear your desks by Friday evening.",
    author: "u3",
    authorName: "Bikash Karki",
    createdAt: "2026-02-05T08:00:00Z",
    pinned: true,
  },
  {
    id: "a2",
    title: "New Pantry Supplier",
    content:
      "We have partnered with a new pantry supplier. Expect a wider variety of snacks and beverages starting next week.",
    author: "u4",
    authorName: "Sita Poudel",
    createdAt: "2026-02-03T10:00:00Z",
    pinned: false,
  },
  {
    id: "a3",
    title: "HVAC Maintenance Notice",
    content:
      "The HVAC system will undergo maintenance on Feb 10. Some areas may experience temporary temperature changes.",
    author: "u3",
    authorName: "Bikash Karki",
    createdAt: "2026-02-01T14:00:00Z",
    pinned: false,
  },
  {
    id: "a4",
    title: "Parking Lot Restriping",
    content:
      "The parking lot will be restriped this weekend. Please use the back entrance on Saturday.",
    author: "u5",
    authorName: "Rajesh Hamal",
    createdAt: "2026-01-28T09:00:00Z",
    pinned: false,
  },
];

// Sort announcements with pinned ones first
export function getSortedAnnouncements() {
  return [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export const lunchTokens: LunchToken[] = [
  {
    id: "lt-001",
    userId: "u1",
    userName: "Aarav Sharma",
    date: "2026-02-08",
    preference: "veg",
    collectedAt: "2026-02-08T09:30:00Z",
  },
  {
    id: "lt-002",
    userId: "u2",
    userName: "Priya Thapa",
    date: "2026-02-08",
    preference: "non-veg",
    collectedAt: "2026-02-08T10:15:00Z",
  },
  {
    id: "lt-003",
    userId: "u3",
    userName: "Bikash Karki",
    date: "2026-02-08",
    preference: "veg",
    collectedAt: "2026-02-08T10:45:00Z",
  },
];

export const notifications: Notification[] = [
  {
    id: "n1",
    userId: "u1",
    title: "Request Resolved",
    message:
      "Your request SR-003: Deep cleaning for 3rd floor has been resolved by Sita Poudel.",
    read: false,
    createdAt: "2026-02-09T08:30:00Z",
    link: "/dashboard/requests/SR-003",
  },
  {
    id: "n2",
    userId: "u1",
    title: "Request On Hold",
    message:
      "Your request SR-007: Pest control for kitchen area has been put on hold pending vendor availability.",
    read: false,
    createdAt: "2026-02-07T14:00:00Z",
    link: "/dashboard/requests/SR-007",
  },
  {
    id: "n3",
    userId: "u2",
    title: "Request In Progress",
    message:
      "Your request SR-006: Restock printer paper is now being handled by Sita Poudel.",
    read: false,
    createdAt: "2026-02-06T09:15:00Z",
    link: "/dashboard/requests/SR-006",
  },
  {
    id: "n4",
    userId: "u2",
    title: "Request Rejected",
    message:
      "Your request SR-008: Request for standing desk has been rejected. Reason: Budget constraints.",
    read: true,
    createdAt: "2026-01-12T11:00:00Z",
    link: "/dashboard/requests/SR-008",
  },
  {
    id: "n5",
    userId: "u3",
    title: "New Assignment",
    message:
      "You have been assigned to request SR-002: AC not working in meeting room B.",
    read: false,
    createdAt: "2026-02-08T10:00:00Z",
    link: "/dashboard/requests/SR-002",
  },
  {
    id: "n6",
    userId: "u3",
    title: "New Assignment",
    message:
      "You have been assigned to request SR-009: Microwave repair in pantry.",
    read: true,
    createdAt: "2026-02-05T10:30:00Z",
    link: "/dashboard/requests/SR-009",
  },
  {
    id: "n7",
    userId: "u4",
    title: "New Assignment",
    message:
      "You have been assigned to request SR-006: Restock printer paper.",
    read: false,
    createdAt: "2026-02-06T09:00:00Z",
    link: "/dashboard/requests/SR-006",
  },
  {
    id: "n8",
    userId: "u5",
    title: "New Announcement Posted",
    message:
      "Bikash Karki posted a new announcement: Office Deep Cleaning Scheduled for Saturday, Feb 8.",
    read: false,
    createdAt: "2026-02-05T08:10:00Z",
    link: "/dashboard/announcements",
  },
];

export const analyticsData: AnalyticsData = {
  totalRequests: 10,
  pendingRequests: 3,
  onHoldRequests: 2,
  inProgressRequests: 3,
  resolvedRequests: 3,
  avgResolutionTimeHours: 38,
  requestsByCategory: [
    { category: "Food and Supplies", count: 3 },
    { category: "Office Maintenance", count: 3 },
    { category: "Cleaning", count: 2 },
    { category: "Other", count: 2 },
  ],
  requestsByMonth: [
    { month: "Oct", count: 5 },
    { month: "Nov", count: 8 },
    { month: "Dec", count: 6 },
    { month: "Jan", count: 12 },
    { month: "Feb", count: 10 },
  ],
  requestsByStatus: [
    { status: "Pending", count: 3 },
    { status: "In Progress", count: 3 },
    { status: "On Hold", count: 2 },
    { status: "Resolved", count: 3 },
    { status: "Rejected", count: 1 },
  ],
};
