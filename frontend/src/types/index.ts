export type BugStatus = "Open" | "InProgress" | "Resolved" | "Closed";
export type UserRole  = "Admin" | "User";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssuerGroup {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  solution?: string;
  status: BugStatus;
  incidentDate: string;
  imageUrl?: string;
  issuerGroupId?: string;
  issuerGroupName?: string;
  reportedBy: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
  categories: { id: string; name: string }[];
}

export interface BugReportList {
  items: BugReport[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserManagement {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isDisabled: boolean;
  createdAt: string;
}

export interface UserList {
  items: UserManagement[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardData {
  totalBugs: number;
  openBugs: number;
  inProgressBugs: number;
  resolvedBugs: number;
  closedBugs: number;
  byCategory: { category: string; count: number }[];
  byMonth: { year: number; month: number; monthName: string; count: number }[];
  recentBugs: { id: string; title: string; status: string; createdAt: string; reporterName: string }[];
}
