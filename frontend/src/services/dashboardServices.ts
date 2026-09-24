// frontend/src/services/dashboardServices.ts
import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { ApiResponse } from "@/types/common.types";
import type {
  DashboardDateFilter,
  UserDashboardOverviewDTO,
  UserBookingsChartDTO,
  UserSpendingChartDTO,
  UserCategoryChartDTO,
  UserStatusChartDTO,
  HostEventsByStatusDTO,
  HostEventsByCategoryDTO,
  HostTicketsSoldChartDTO,
  HostRatingDistributionDTO,
  AdminDashboardOverviewDTO,
  AdminRevenueChartDTO,
  AdminUserGrowthChartDTO,
  AdminEventsByCategoryDTO,
  AdminEventsByStatusDTO,
  AdminTopHostsDTO,
} from "@/types/dashboard.types";





const buildQuery = (filter: DashboardDateFilter): string => {
  const params = new URLSearchParams();
  if (filter.preset) params.set("preset", filter.preset);
  if (filter.from) params.set("from", filter.from);
  if (filter.to) params.set("to", filter.to);
  return params.toString();
};





export const dashboardServices = {
  // ─── User / Host ────────────────────────────────────────────────────────
  getUserOverview: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<UserDashboardOverviewDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<UserDashboardOverviewDTO>>(
      `${API_ENDPOINTS.USER_DASHBOARD.OVERVIEW}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getUserBookingsChart: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<UserBookingsChartDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<UserBookingsChartDTO>>(
      `${API_ENDPOINTS.USER_DASHBOARD.BOOKINGS_CHART}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getUserSpendingChart: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<UserSpendingChartDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<UserSpendingChartDTO>>(
      `${API_ENDPOINTS.USER_DASHBOARD.SPENDING_CHART}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getUserCategoryChart: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<UserCategoryChartDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<UserCategoryChartDTO>>(
      `${API_ENDPOINTS.USER_DASHBOARD.CATEGORY_CHART}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getUserStatusChart: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<UserStatusChartDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<UserStatusChartDTO>>(
      `${API_ENDPOINTS.USER_DASHBOARD.STATUS_CHART}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  // ─── Host-specific ──────────────────────────────────────────────────────
  getHostEventsByStatus: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<HostEventsByStatusDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<HostEventsByStatusDTO>>(
      `${API_ENDPOINTS.USER_DASHBOARD.HOST_EVENTS_BY_STATUS}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getHostEventsByCategory: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<HostEventsByCategoryDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<HostEventsByCategoryDTO>>(
      `${API_ENDPOINTS.USER_DASHBOARD.HOST_EVENTS_BY_CATEGORY}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getHostTicketsSoldChart: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<HostTicketsSoldChartDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<HostTicketsSoldChartDTO>>(
      `${API_ENDPOINTS.USER_DASHBOARD.HOST_TICKETS_SOLD_CHART}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getHostRatingDistribution: async (): Promise<ApiResponse<HostRatingDistributionDTO>> => {
    const response = await axiosInstance.get<ApiResponse<HostRatingDistributionDTO>>(
      API_ENDPOINTS.USER_DASHBOARD.HOST_RATING_DISTRIBUTION,
      { withCredentials: true }
    );
    return response.data;
  },

  // ─── Admin ──────────────────────────────────────────────────────────────
  getAdminOverview: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<AdminDashboardOverviewDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<AdminDashboardOverviewDTO>>(
      `${API_ENDPOINTS.ADMIN_DASHBOARD.OVERVIEW}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getAdminRevenueChart: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<AdminRevenueChartDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<AdminRevenueChartDTO>>(
      `${API_ENDPOINTS.ADMIN_DASHBOARD.REVENUE_CHART}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getAdminUserGrowthChart: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<AdminUserGrowthChartDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<AdminUserGrowthChartDTO>>(
      `${API_ENDPOINTS.ADMIN_DASHBOARD.USER_GROWTH_CHART}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getAdminEventsByCategory: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<AdminEventsByCategoryDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<AdminEventsByCategoryDTO>>(
      `${API_ENDPOINTS.ADMIN_DASHBOARD.EVENTS_BY_CATEGORY}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getAdminEventsByStatus: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<AdminEventsByStatusDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<AdminEventsByStatusDTO>>(
      `${API_ENDPOINTS.ADMIN_DASHBOARD.EVENTS_BY_STATUS}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },

  getAdminTopHosts: async (
    filter: DashboardDateFilter = {}
  ): Promise<ApiResponse<AdminTopHostsDTO>> => {
    const query = buildQuery(filter);
    const response = await axiosInstance.get<ApiResponse<AdminTopHostsDTO>>(
      `${API_ENDPOINTS.ADMIN_DASHBOARD.TOP_HOSTS}?${query}`,
      { withCredentials: true }
    );
    return response.data;
  },
};