import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useNavigate } from "react-router-dom";
import { notificationService, type GetNotificationsResponse, type NotificationEntity } from "@/services/notificationServices";
import type { ApiResponse } from "@/types/common.types";
import { getNotificationDisplay, formatRelativeTime } from "@/lib/notification-display-utils";
import { toast } from "react-toastify";
import { getSocket, initializeSocket } from "@/services/socketService";
import { useAuth } from "@/contexts/AuthContext";







export function NotificationBell() {
   const [notifications, setNotifications] = useState<NotificationEntity[]>([]);
   const [unreadCount, setUnreadCount] = useState(0);
   const navigate = useNavigate();

   const { accessToken } = useAuth();



   const fetchNotifications = async () => {
      try {
         const response: ApiResponse<GetNotificationsResponse> = await notificationService.getNotifications(1, 10);

         setNotifications(response.data.notifications);
         setUnreadCount(response.data.unreadCount);
      } catch (error) {
         console.error("Failed to fetch notifications", error);
      }
   };



   useEffect(() => {
      if (!accessToken) return;

      fetchNotifications();

      const socket = initializeSocket(accessToken);

      const handleNewNotification = (newNotification: NotificationEntity) => {
         setNotifications((prev) => [newNotification, ...prev]);
         setUnreadCount((prev) => prev + 1);
         toast.info(`New Notification: ${newNotification.title}`);
      };

      socket.on("new_notification", handleNewNotification);

      return () => {
         socket.off("new_notification", handleNewNotification);
      };
   }, [accessToken]);



   const markNotificationAsRead = async (id: string) => {
      try {
         await notificationService.markAsRead(id);
         setNotifications((prev) => prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)));
         setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
         console.error("Failed to mark as read", error);
      }
   };


   const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const target = notifications.find((n) => n.notificationId === id);
      if (target && !target.isRead) {
         markNotificationAsRead(id);
      }
   };



   const handleMarkAllAsRead = async () => {
      try {
         await notificationService.markAllAsRead();
         setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
         setUnreadCount(0);
      } catch (error) {
         console.error("Failed to mark all as read", error);
      }
   };




   const handleNotificationClick = (notification: NotificationEntity) => {
      if (!notification.isRead) {
         markNotificationAsRead(notification.notificationId);
      }


      const related = notification as unknown as {
         relatedEntityType?: string;
         relatedEntityId?: string;
      };
      if (related.relatedEntityType === "booking" && related.relatedEntityId) {
         navigate(`/my-bookings/${related.relatedEntityId}`);
      } else if (related.relatedEntityType === "event" && related.relatedEntityId) {
         navigate(`/events/${related.relatedEntityId}`);
      }
   };



   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-(--bg-tertiary)">
               <Bell className="h-4.5 w-4.5 text-(--text-secondary)" />
               {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 flex h-5 w-5 animate-scaleIn items-center justify-center rounded-full border-2 border-(--bg-primary) bg-(--brand-primary) p-0 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
               )}
            </Button>
         </DropdownMenuTrigger>

         <DropdownMenuContent
            align="end"
            className="w-96 max-w-[92vw] overflow-hidden border-(--border-strong) p-0 shadow-(--shadow-lg)"
         >
            <div className="flex items-center justify-between border-b border-(--border-default) px-3.5 py-2.5">
               <DropdownMenuLabel className="p-0 text-sm font-semibold text-(--heading-primary)">
                  Notifications
               </DropdownMenuLabel>
               {unreadCount > 0 && (
                  <button
                     onClick={handleMarkAllAsRead}
                     className="flex items-center gap-1 text-xs font-medium text-(--brand-primary) transition-colors hover:text-(--brand-primary-hover)"
                  >
                  <CheckCheck className="h-3.5 w-3.5" />
                     Mark all read
                  </button>
               )}
            </div>

            <div className="custom-scrollbar max-h-100 overflow-y-auto py-1">
               {notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                     <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--bg-secondary)">
                        <Bell className="h-5 w-5 text-(--text-tertiary)" />
                     </span>
                     <p className="text-sm font-medium text-(--text-secondary)">You're all caught up</p>
                     <p className="text-xs text-(--text-tertiary)">New notifications will show up here</p>
                  </div>
               ) : (
                  notifications.map((notification) => {
                  const { Icon, bg, text } = getNotificationDisplay(
                     (notification as unknown as { notificationType?: string }).notificationType
                  );
                  const isUnread = !notification.isRead;

                  return (
                     <div
                        key={notification.notificationId}
                        role="menuitem"
                        onClick={() => handleNotificationClick(notification)}
                        className={`group relative mx-1 my-0.5 flex cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2.5 transition-colors duration-150 ${
                        isUnread ? "bg-(--bg-tertiary)" : ""
                        } hover:bg-(--bg-neutral)`}
                     >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
                           <Icon className={`h-4.5 w-4.5 ${text}`} />
                        </span>

                        <div className="min-w-0 flex-1">
                           <div className="flex items-start justify-between gap-2">
                              <p
                                 className={`text-sm leading-snug ${
                                 isUnread ? "font-semibold text-(--heading-primary)" : "font-normal text-(--text-secondary)"
                                 }`}
                              >
                                 {notification.title}
                              </p>
                              {isUnread && (
                                 <span className="relative mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center">
                                 <span className="absolute h-2 w-2 rounded-full bg-(--brand-primary) transition-opacity duration-150 group-hover:opacity-0" />
                                 <button
                                    onClick={(e) => handleMarkAsRead(notification.notificationId, e)}
                                    aria-label="Mark as read"
                                    className="absolute rounded-full p-1 text-(--text-tertiary) opacity-0 transition-opacity duration-150 hover:bg-(--bg-accent) hover:text-(--brand-primary) group-hover:opacity-100"
                                 >
                                    <Check className="h-3.5 w-3.5" />
                                 </button>
                                 </span>
                              )}
                           </div>

                           <p
                              className={`mt-0.5 line-clamp-2 text-xs leading-snug ${
                                 isUnread ? "text-(--text-secondary)" : "text-(--text-tertiary)"
                              }`}
                           >
                              {notification.message}
                           </p>

                           {(notification as unknown as { createdAt?: string }).createdAt && (
                              <div className="mt-1.5 flex justify-end">
                                 <span className="text-[11px] text-(--text-tertiary)">
                                 {formatRelativeTime(
                                    (notification as unknown as { createdAt: string }).createdAt
                                 )}
                                 </span>
                              </div>
                           )}
                        </div>
                     </div>
                  );
                  })
               )}
            </div>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}