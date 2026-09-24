// backend/src/services/dashboard-services/interfaces/IDashboardService.ts
import { DashboardDateFilter } from "@/types/dashboard.types";
import {
  UserDashboardOverviewDTO,
  UserBookingsChartDTO,
  UserSpendingChartDTO,
  UserCategoryChartDTO,
  UserStatusChartDTO,
  AdminDashboardOverviewDTO,
  AdminRevenueChartDTO,
  AdminUserGrowthChartDTO,
  AdminEventsByCategoryDTO,
  AdminEventsByStatusDTO,
  AdminTopHostsDTO,
  HostRatingDistributionDTO,
  HostTicketsSoldChartDTO,
  HostEventsByCategoryDTO,
  HostEventsByStatusDTO,
} from "@/dtos/dashboard.dto";




export interface IDashboardService {
    // FOR USER DASHBOARDS ___________________________________________________
    getUserOverview(userId: string, filter: DashboardDateFilter, role: string): Promise<UserDashboardOverviewDTO>;

    getUserBookingsChart(userId: string, filter: DashboardDateFilter): Promise<UserBookingsChartDTO>;

    getUserSpendingChart(userId: string, filter: DashboardDateFilter): Promise<UserSpendingChartDTO>;

    getUserCategoryChart(userId: string, filter: DashboardDateFilter): Promise<UserCategoryChartDTO>;

    getUserStatusChart(userId: string, filter: DashboardDateFilter): Promise<UserStatusChartDTO>;


    // FOR HOST DASHBOARDS ___________________________________________________
    getHostEventsByStatus(hostId: string, filter: DashboardDateFilter): Promise<HostEventsByStatusDTO>;

    getHostEventsByCategory(hostId: string, filter: DashboardDateFilter): Promise<HostEventsByCategoryDTO>;

    getHostTicketsSoldChart(hostId: string, filter: DashboardDateFilter): Promise<HostTicketsSoldChartDTO>;
    
    getHostRatingDistribution(hostId: string): Promise<HostRatingDistributionDTO>;



    // FOR ADMIN DASHBOARDS ___________________________________________________
    getAdminOverview(filter: DashboardDateFilter): Promise<AdminDashboardOverviewDTO>;

    getAdminRevenueChart(filter: DashboardDateFilter): Promise<AdminRevenueChartDTO>;

    getAdminUserGrowthChart(filter: DashboardDateFilter): Promise<AdminUserGrowthChartDTO>;

    getAdminEventsByCategory(filter: DashboardDateFilter): Promise<AdminEventsByCategoryDTO>;

    getAdminEventsByStatus(filter: DashboardDateFilter): Promise<AdminEventsByStatusDTO>;

    getAdminTopHosts(filter: DashboardDateFilter): Promise<AdminTopHostsDTO>;
}