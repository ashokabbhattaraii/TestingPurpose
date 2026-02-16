export type UserRole = "employee" | "admin" | "superadmin";

export type RequestStatus =
  | "pending"
  | "on-hold"
  | "in-progress"
  | "resolved"
  | "rejected";

export type RequestCategory =
  | "Food and Supplies"
  | "Office Maintenance"
  | "Cleaning"
  | "Other";

export type SocialProvider = "google" | "github" | "linkedin";
export interface SocialAccount {
  provider: SocialProvider;
  email: string;
  connectedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  department: string;
  joinedAt: string;
  status: "active" | "inactive";
  lastLogin?: string;
  socialAccounts?: SocialAccount[];
  notificationPreferences?: {
    emailNotifications: boolean;
    announcements: boolean;
    assignments: boolean;
  };
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  status: RequestStatus;
  otherCategory?: string;
  priority: "low" | "medium" | "high";
  createdBy: string;
  createdByName: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: string;
  pinned: boolean;
}

export type MealPreference = "veg" | "non-veg";

export interface LunchToken {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  preference: MealPreference;
  collectedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AnalyticsData {
  totalRequests: number;
  pendingRequests: number;
  onHoldRequests: number;
  inProgressRequests: number;

  resolvedRequests: number;
  avgResolutionTimeHours: number;
  requestsByCategory: { category: string; count: number }[];
  requestsByMonth: { month: string; count: number }[];
  requestsByStatus: { status: string; count: number }[];
}
