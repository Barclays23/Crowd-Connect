// backend/src/repositories/interfaces/IDashboardRepository.ts
import { DashboardDateRange } from "@/types/dashboard.types";
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




export interface IDashboardRepository {
    // FOR USER DASHBOARDS ___________________________________________________
    getUserOverview(userId: string, range: DashboardDateRange, isHost: boolean): Promise<UserDashboardOverviewDTO>;

    getUserBookingsChart(userId: string, range: DashboardDateRange): Promise<UserBookingsChartDTO>;

    getUserSpendingChart(userId: string, range: DashboardDateRange): Promise<UserSpendingChartDTO>;

    getUserCategoryChart(userId: string, range: DashboardDateRange): Promise<UserCategoryChartDTO>;

    getUserStatusChart(userId: string, range: DashboardDateRange): Promise<UserStatusChartDTO>;



    // FOR HOST DASHBOARDS ___________________________________________________
    getHostEventsByStatus(hostId: string, range: DashboardDateRange): Promise<HostEventsByStatusDTO>;

    getHostEventsByCategory(hostId: string, range: DashboardDateRange): Promise<HostEventsByCategoryDTO>;

    getHostTicketsSoldChart(hostId: string, range: DashboardDateRange): Promise<HostTicketsSoldChartDTO>;

    getHostRatingDistribution( hostId: string): Promise<HostRatingDistributionDTO>;


    // FOR ADMIN DASHBOARDS ___________________________________________________
    getAdminOverview(range: DashboardDateRange): Promise<AdminDashboardOverviewDTO>;

    getAdminRevenueChart(range: DashboardDateRange): Promise<AdminRevenueChartDTO>;

    getAdminUserGrowthChart(range: DashboardDateRange): Promise<AdminUserGrowthChartDTO>;

    getAdminEventsByCategory(range: DashboardDateRange): Promise<AdminEventsByCategoryDTO>;

    getAdminEventsByStatus(range: DashboardDateRange): Promise<AdminEventsByStatusDTO>;

    getAdminTopHosts(range: DashboardDateRange, limit?: number): Promise<AdminTopHostsDTO>;
}