// backend/src/routes/notification.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { notificationController } from "@/container/dependencies"; // Assuming you export it from your DI container
import { USER_ROLES } from "@/constants/user-system.constants";



const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.use(authorize(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN));



notificationRouter.get("/", notificationController.getMyNotifications.bind(notificationController));
notificationRouter.get("/unread-count", notificationController.getUnreadCount.bind(notificationController));

notificationRouter.patch("/:notificationId/read", notificationController.markAsRead.bind(notificationController));
notificationRouter.patch("/read-all", notificationController.markAllAsRead.bind(notificationController));


export default notificationRouter;