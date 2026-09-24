import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { USER_ROLES } from "@/constants/user-system.constants";
import { ADMIN_DASHBOARD_ROUTES } from "@/constants/routes.constants";
import { adminDashboardController } from "@/container/dependencies";



export const adminDashboardRouter = Router();


adminDashboardRouter.use(authenticate);
adminDashboardRouter.use(authorize(USER_ROLES.ADMIN));




adminDashboardRouter.get(ADMIN_DASHBOARD_ROUTES.OVERVIEW, adminDashboardController.getOverview.bind(adminDashboardController));

adminDashboardRouter.get(ADMIN_DASHBOARD_ROUTES.REVENUE_CHART, adminDashboardController.getRevenueChart.bind(adminDashboardController));

adminDashboardRouter.get(ADMIN_DASHBOARD_ROUTES.USER_GROWTH_CHART, adminDashboardController.getUserGrowthChart.bind(adminDashboardController));

adminDashboardRouter.get(ADMIN_DASHBOARD_ROUTES.EVENTS_BY_CATEGORY, adminDashboardController.getEventsByCategory.bind(adminDashboardController));

adminDashboardRouter.get(ADMIN_DASHBOARD_ROUTES.EVENTS_BY_STATUS, adminDashboardController.getEventsByStatus.bind(adminDashboardController));

adminDashboardRouter.get(ADMIN_DASHBOARD_ROUTES.TOP_HOSTS, adminDashboardController.getTopHosts.bind(adminDashboardController));



export default adminDashboardRouter;