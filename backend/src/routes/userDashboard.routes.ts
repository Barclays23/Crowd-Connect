// backend/src/routes/userDashboard.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { USER_ROLES } from "@/constants/user-system.constants";
import { USER_DASHBOARD_ROUTES } from "@/constants/routes.constants";
import { userDashboardController } from "@/container/dependencies";



export const userDashboardRouter = Router();



userDashboardRouter.use(authenticate);


const requireGeneralAccess = authorize(USER_ROLES.USER, USER_ROLES.HOST);
const requireHostAccess = authorize(USER_ROLES.HOST);




// GENERAL ROUTES (Accessible by USER & HOST)
// ==========================================

userDashboardRouter.get(
  USER_DASHBOARD_ROUTES.OVERVIEW, 
  requireGeneralAccess, 
  userDashboardController.getOverview.bind(userDashboardController)
);

userDashboardRouter.get(
  USER_DASHBOARD_ROUTES.BOOKINGS_CHART, 
  requireGeneralAccess, 
  userDashboardController.getBookingsChart.bind(userDashboardController)
);

userDashboardRouter.get(
  USER_DASHBOARD_ROUTES.SPENDING_CHART, 
  requireGeneralAccess, 
  userDashboardController.getSpendingChart.bind(userDashboardController)
);

userDashboardRouter.get(
  USER_DASHBOARD_ROUTES.CATEGORY_CHART, 
  requireGeneralAccess, 
  userDashboardController.getCategoryChart.bind(userDashboardController)
);

userDashboardRouter.get(
  USER_DASHBOARD_ROUTES.STATUS_CHART, 
  requireGeneralAccess, 
  userDashboardController.getStatusChart.bind(userDashboardController)
);


// HOST-SPECIFIC ROUTES (Accessible by HOST ONLY)
// ==========================================

userDashboardRouter.get(
  USER_DASHBOARD_ROUTES.HOST_EVENTS_BY_STATUS,
  requireHostAccess,
  userDashboardController.getHostEventsByStatus.bind(userDashboardController)
);

userDashboardRouter.get(
  USER_DASHBOARD_ROUTES.HOST_EVENTS_BY_CATEGORY,
  requireHostAccess,
  userDashboardController.getHostEventsByCategory.bind(userDashboardController)
);

userDashboardRouter.get(
  USER_DASHBOARD_ROUTES.HOST_TICKETS_SOLD_CHART,
  requireHostAccess,
  userDashboardController.getHostTicketsSoldChart.bind(userDashboardController)
);

userDashboardRouter.get(
  USER_DASHBOARD_ROUTES.HOST_RATING_DISTRIBUTION,
  requireHostAccess,
  userDashboardController.getHostRatingDistribution.bind(userDashboardController)
);



export default userDashboardRouter;