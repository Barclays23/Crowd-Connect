// frontend/src/types/dashboard.types.ts

export type DashboardPreset = "week" | "month" | "year" | "custom";

export interface DashboardDateFilter {
  preset?: DashboardPreset;
  from?: string;
  to?: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

// ─── User / Host Overview ───────────────────────────────────────────────────
export interface UserDashboardOverviewDTO {
  totalBookings: number;
  upcomingEvents: number;
  attendedEvents: number;
  walletBalance: number;
  totalSpent: number;

  // Host-only fields
  hostTotalEvents: number | null;
  hostPublishedEvents: number | null;
  hostCompletedEvents: number | null;
  hostTotalTicketsSold: number | null;
  hostTotalCheckIns: number | null;
  hostAttendanceRate: number | null;
  hostGrossRevenue: number | null;
  hostNetRevenue: number | null;
  hostAverageRating: number | null;
  hostTotalReviews: number | null;
  pendingPayoutsAmount: number | null;
}

export interface UserBookingsChartDTO {
  points: ChartPoint[];
}

export interface UserSpendingChartDTO {
  points: ChartPoint[];
}

export interface UserCategoryChartDTO {
  categories: NamedValue[];
}

export interface UserStatusChartDTO {
  statuses: StatusCount[];
}

// ─── Host-specific charts ───────────────────────────────────────────────────
export interface HostEventsByStatusDTO {
  statuses: StatusCount[];
}

export interface HostEventsByCategoryDTO {
  categories: NamedValue[];
}

export interface HostTicketsSoldChartDTO {
  points: ChartPoint[];
}

export interface HostRatingDistributionDTO {
  distribution: Array<{
    rating: number;
    count: number;
  }>;
}

// ─── Admin (unchanged) ──────────────────────────────────────────────────────
export interface AdminDashboardOverviewDTO {
  totalUsers: number;
  activeUsers: number;
  totalHosts: number;
  pendingHostApplications: number;
  totalEvents: number;
  publishedEvents: number;
  totalBookings: number;
  grossRevenue: number;
  platformCommission: number;
  pendingPayoutsCount: number;
  pendingPayoutsAmount: number;
  averageEventRating: number;
}

export interface AdminRevenueChartDTO {
  points: ChartPoint[];
}

export interface AdminUserGrowthChartDTO {
  points: ChartPoint[];
}

export interface AdminEventsByCategoryDTO {
  categories: NamedValue[];
}

export interface AdminEventsByStatusDTO {
  statuses: StatusCount[];
}

export interface AdminTopHostsDTO {
  hosts: Array<{
    hostId: string;
    name: string;
    organizationName: string | null;
    revenue: number;
    rating: number;
  }>;
}