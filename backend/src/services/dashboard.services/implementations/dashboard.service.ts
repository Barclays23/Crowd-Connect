// backend/src/services/dashboard-services/implementations/dashboard.service.ts
import { IDashboardRepository } from "@/repositories/interfaces/IDashboardRepository";
import { IDashboardService } from "../interfaces/IDashboardService";
import { DashboardDateFilter, DashboardDateRange } from "@/types/dashboard.types";
import { USER_ROLES } from "@/constants/user-system.constants";
import { IPlatformSettingsService } from "@/services/platform-settings-services/interfaces/IPlatformSettingsService";
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



export class DashboardService implements IDashboardService {
    constructor(
        private readonly _dashboardRepository: IDashboardRepository,
        private readonly _settingsService: IPlatformSettingsService,
    ) {}

    private resolveDateRange(filter: DashboardDateFilter): DashboardDateRange {
        const now = new Date();
        let start: Date;
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);

        if (filter.preset === "week") {
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        } else if (filter.preset === "month") {
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        } else if (filter.preset === "year") {
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        } else if (filter.from && filter.to) {
        start = new Date(filter.from);
        end.setTime(new Date(filter.to).getTime());
        end.setHours(23, 59, 59, 999);
        } else {
        // default last 30 days
        start = new Date(now);
        start.setDate(start.getDate() - 30);
        }

        start.setHours(0, 0, 0, 0);
        return { start, end };
    }


    // FOR USER DASHBOARDS ___________________________________________________
    async getUserOverview(
        userId: string,
        filter: DashboardDateFilter,
        role: string,
    ): Promise<UserDashboardOverviewDTO> {
        const range = this.resolveDateRange(filter);
        const isHost = role === USER_ROLES.HOST;

        const overview = await this._dashboardRepository.getUserOverview(
        userId,
        range,
        isHost,
        );

        // Calculate net revenue using live commission rate
        if (isHost && overview.hostGrossRevenue !== null) {
        const settings =
            await this._settingsService.getOperationalSettingsDomain();
        const commissionRate = (settings?.commissionPercent ?? 10) / 100;
        overview.hostNetRevenue = Math.round(
            overview.hostGrossRevenue * (1 - commissionRate),
        );
        }

        return overview;
    }

    async getUserBookingsChart(
        userId: string,
        filter: DashboardDateFilter,
    ): Promise<UserBookingsChartDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getUserBookingsChart(userId, range);
    }

    async getUserSpendingChart(
        userId: string,
        filter: DashboardDateFilter,
    ): Promise<UserSpendingChartDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getUserSpendingChart(userId, range);
    }

    async getUserCategoryChart(
        userId: string,
        filter: DashboardDateFilter,
    ): Promise<UserCategoryChartDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getUserCategoryChart(userId, range);
    }

    async getUserStatusChart(
        userId: string,
        filter: DashboardDateFilter,
    ): Promise<UserStatusChartDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getUserStatusChart(userId, range);
    }


    // FOR HOST DASHBOARDS __________________________________________________
    async getHostEventsByStatus(
        hostId: string,
        filter: DashboardDateFilter,
    ): Promise<HostEventsByStatusDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getHostEventsByStatus(hostId, range);
    }

    async getHostEventsByCategory(
        hostId: string,
        filter: DashboardDateFilter,
    ): Promise<HostEventsByCategoryDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getHostEventsByCategory(hostId, range);
    }

    async getHostTicketsSoldChart(
        hostId: string,
        filter: DashboardDateFilter,
    ): Promise<HostTicketsSoldChartDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getHostTicketsSoldChart(hostId, range);
    }

    async getHostRatingDistribution(
        hostId: string,
    ): Promise<HostRatingDistributionDTO> {
        return this._dashboardRepository.getHostRatingDistribution(hostId);
    }



    // FOR ADMIN DASHBOARDS __________________________________________________
    async getAdminOverview(
        filter: DashboardDateFilter,
    ): Promise<AdminDashboardOverviewDTO> {
        const range = this.resolveDateRange(filter);
        const overview = await this._dashboardRepository.getAdminOverview(range);

        const settings = await this._settingsService.getOperationalSettingsDomain();
        const commissionRate = (settings?.commissionPercent ?? 10) / 100;
        overview.platformCommission = Math.round(
        overview.grossRevenue * commissionRate,
        );

        return overview;
    }

    async getAdminRevenueChart(
        filter: DashboardDateFilter,
    ): Promise<AdminRevenueChartDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getAdminRevenueChart(range);
    }

    async getAdminUserGrowthChart(
        filter: DashboardDateFilter,
    ): Promise<AdminUserGrowthChartDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getAdminUserGrowthChart(range);
    }

    async getAdminEventsByCategory(
        filter: DashboardDateFilter,
    ): Promise<AdminEventsByCategoryDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getAdminEventsByCategory(range);
    }

    async getAdminEventsByStatus(
        filter: DashboardDateFilter,
    ): Promise<AdminEventsByStatusDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getAdminEventsByStatus(range);
    }

    async getAdminTopHosts(
        filter: DashboardDateFilter,
    ): Promise<AdminTopHostsDTO> {
        const range = this.resolveDateRange(filter);
        return this._dashboardRepository.getAdminTopHosts(range, 10);
    }
}