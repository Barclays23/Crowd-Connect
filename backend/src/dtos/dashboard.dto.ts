// backend/src/dtos/dashboard.dto.ts
import { ChartPoint, NamedValue, StatusCount } from "@/types/dashboard.types";

// ─── User / Host Overview ───────────────────────────────────────────────────
export interface UserDashboardOverviewDTO {
  // Common (User + Host)
  totalBookings: number;
  upcomingEvents: number;
  attendedEvents: number;
  walletBalance: number;
  totalSpent: number;

  // Host-only fields (null for pure USER role)
  hostTotalEvents: number | null;
  hostPublishedEvents: number | null;
  hostCompletedEvents: number | null;
  hostTotalTicketsSold: number | null;
  hostTotalCheckIns: number | null;
  hostAttendanceRate: number | null;          // percentage 0-100
  hostGrossRevenue: number | null;
  hostNetRevenue: number | null;
  hostAverageRating: number | null;
  hostTotalReviews: number | null;
  pendingPayoutsAmount: number | null;
}

// Existing user charts
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

// ─── New Host-specific charts ───────────────────────────────────────────────
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
    rating: number;   // 1, 2, 3, 4, 5
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