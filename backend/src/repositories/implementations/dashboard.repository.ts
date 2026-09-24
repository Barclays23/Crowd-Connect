// backend/src/repositories/implementations/dashboard.repository.ts
import { Types } from "mongoose";
import Booking from "@/models/implementations/booking.model";
import Event from "@/models/implementations/event.model";
import User from "@/models/implementations/user.model";
import { PayoutRequestModel } from "@/models/implementations/payoutRequest.model";
import { BOOKING_STATUSES } from "@/constants/booking.constants";
import { EVENT_STATUSES } from "@/constants/event.constants";
import { USER_ROLES, USER_STATUS, HOST_STATUS } from "@/constants/user-system.constants";
import { PAYOUT_REQUEST_STATUSES } from "@/constants/payout.constants";
import { IDashboardRepository } from "@/repositories/interfaces/IDashboardRepository";
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
  HostEventsByStatusDTO,
  HostEventsByCategoryDTO,
  HostTicketsSoldChartDTO,
  HostRatingDistributionDTO,
} from "@/dtos/dashboard.dto";
import Review from "@/models/implementations/review.model";





export class DashboardRepository implements IDashboardRepository {

   // FOR USER DASHBOARDS ___________________________________________________
   async getUserOverview(
      userId: string,
      range: DashboardDateRange,
      isHost: boolean
   ): Promise<UserDashboardOverviewDTO> {
      const userObjectId = new Types.ObjectId(userId);

      const [
         bookingStats,
         walletDoc,
         upcomingAgg,
         hostEventStats,
         pendingPayoutAgg,
         hostUserDoc,
      ] = await Promise.all([
         // 1. User booking stats
         Booking.aggregate([
            {
            $match: {
               userRef: userObjectId,
               createdAt: { $gte: range.start, $lte: range.end },
            },
            },
            {
            $group: {
               _id: null,
               totalBookings: { $sum: 1 },
               totalSpent: {
                  $sum: {
                  $cond: [
                     {
                        $in: [
                        "$bookingStatus",
                        [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.ATTENDED],
                        ],
                     },
                     "$totalAmount",
                     0,
                  ],
                  },
               },
               attended: {
                  $sum: {
                  $cond: [{ $ne: ["$checkedInAt", null] }, 1, 0],
                  },
               },
            },
            },
         ]),

         // 2. Wallet balance
         User.findById(userId).select("walletBalance ratingAverage totalReviews").lean(),

         // 3. Upcoming events (future confirmed bookings)
         Booking.aggregate([
            {
            $match: {
               userRef: userObjectId,
               bookingStatus: {
                  $in: [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.ATTENDED],
               },
            },
            },
            {
            $lookup: {
               from: "events",
               localField: "eventRef",
               foreignField: "_id",
               as: "event",
            },
            },
            { $unwind: "$event" },
            {
            $match: {
               "event.startDateTime": { $gt: new Date() },
            },
            },
            { $count: "count" },
         ]),

         // 4. Host event stats (only if host)
         isHost
            ? Event.aggregate([
               {
                  $match: {
                  hostRef: userObjectId,
                  // Optional: filter by date range if you want
                  // createdAt: { $gte: range.start, $lte: range.end },
                  },
               },
               {
                  $group: {
                  _id: null,
                  totalEvents: { $sum: 1 },
                  publishedEvents: {
                     $sum: {
                        $cond: [
                        { $eq: ["$eventStatus", EVENT_STATUSES.PUBLISHED] },
                        1,
                        0,
                        ],
                     },
                  },
                  completedEvents: {
                     $sum: {
                        $cond: [
                        { $eq: ["$eventStatus", EVENT_STATUSES.COMPLETED] },
                        1,
                        0,
                        ],
                     },
                  },
                  totalTicketsSold: { $sum: "$soldTickets" },
                  totalCheckIns: { $sum: "$checkedInCount" },
                  grossRevenue: { $sum: "$grossTicketRevenue" },
                  },
               },
            ])
            : Promise.resolve([]),

         // 5. Pending payouts
         isHost
            ? PayoutRequestModel.aggregate([
               {
                  $match: {
                  hostRef: userObjectId,
                  status: PAYOUT_REQUEST_STATUSES.PENDING,
                  },
               },
               {
                  $group: {
                  _id: null,
                  amount: { $sum: "$netAmount" },
                  },
               },
            ])
            : Promise.resolve([]),

         // 6. Host rating from User document (more accurate)
         isHost
            ? User.findById(userId).select("ratingAverage totalReviews").lean()
            : Promise.resolve(null),
      ]);

      const stats = bookingStats[0] ?? {
         totalBookings: 0,
         totalSpent: 0,
         attended: 0,
      };

      const hostStats = hostEventStats[0] ?? null;

      // Attendance rate calculation
      let attendanceRate: number | null = null;
      if (isHost && hostStats && hostStats.totalTicketsSold > 0) {
         attendanceRate = Number(
            ((hostStats.totalCheckIns / hostStats.totalTicketsSold) * 100).toFixed(1)
         );
      }

      return {
         totalBookings: stats.totalBookings,
         upcomingEvents: upcomingAgg[0]?.count ?? 0,
         attendedEvents: stats.attended,
         walletBalance: walletDoc?.walletBalance ?? 0,
         totalSpent: stats.totalSpent,

         // Host fields
         hostTotalEvents: isHost ? (hostStats?.totalEvents ?? 0) : null,
         hostPublishedEvents: isHost ? (hostStats?.publishedEvents ?? 0) : null,
         hostCompletedEvents: isHost ? (hostStats?.completedEvents ?? 0) : null,
         hostTotalTicketsSold: isHost ? (hostStats?.totalTicketsSold ?? 0) : null,
         hostTotalCheckIns: isHost ? (hostStats?.totalCheckIns ?? 0) : null,
         hostAttendanceRate: attendanceRate,
         hostGrossRevenue: isHost ? (hostStats?.grossRevenue ?? 0) : null,
         hostNetRevenue: null, // calculated in service with commission
         hostAverageRating: isHost
            ? Number((hostUserDoc?.ratingAverage ?? 0).toFixed(2))
            : null,
         hostTotalReviews: isHost ? (hostUserDoc?.totalReviews ?? 0) : null,
         pendingPayoutsAmount: isHost
            ? (pendingPayoutAgg[0]?.amount ?? 0)
            : null,
      };
   }

   async getUserBookingsChart(
      userId: string,
      range: DashboardDateRange
   ): Promise<UserBookingsChartDTO> {
      const result = await Booking.aggregate([
         {
         $match: {
            userRef: new Types.ObjectId(userId),
            createdAt: { $gte: range.start, $lte: range.end },
         },
         },
         {
         $group: {
            _id: {
               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            value: { $sum: 1 },
         },
         },
         { $sort: { _id: 1 } },
         {
         $project: {
            _id: 0,
            label: "$_id",
            value: 1,
         },
         },
      ]);

      return { points: result };
   }

   async getUserSpendingChart(
      userId: string,
      range: DashboardDateRange
   ): Promise<UserSpendingChartDTO> {
      const result = await Booking.aggregate([
         {
         $match: {
            userRef: new Types.ObjectId(userId),
            createdAt: { $gte: range.start, $lte: range.end },
            bookingStatus: {
               $in: [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.ATTENDED],
            },
         },
         },
         {
         $group: {
            _id: {
               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            value: { $sum: "$totalAmount" },
         },
         },
         { $sort: { _id: 1 } },
         {
         $project: {
            _id: 0,
            label: "$_id",
            value: 1,
         },
         },
      ]);

      return { points: result };
   }

   async getUserCategoryChart(
      userId: string,
      range: DashboardDateRange
   ): Promise<UserCategoryChartDTO> {
      const result = await Booking.aggregate([
         {
         $match: {
            userRef: new Types.ObjectId(userId),
            createdAt: { $gte: range.start, $lte: range.end },
         },
         },
         {
         $lookup: {
            from: "events",
            localField: "eventRef",
            foreignField: "_id",
            as: "event",
         },
         },
         { $unwind: "$event" },
         {
         $group: {
            _id: "$event.category",
            value: { $sum: 1 },
         },
         },
         {
         $project: {
            _id: 0,
            name: "$_id",
            value: 1,
         },
         },
         { $sort: { value: -1 } },
      ]);

      return { categories: result };
   }

   async getUserStatusChart(
      userId: string,
      range: DashboardDateRange
   ): Promise<UserStatusChartDTO> {
      const result = await Booking.aggregate([
         {
         $match: {
            userRef: new Types.ObjectId(userId),
            createdAt: { $gte: range.start, $lte: range.end },
         },
         },
         {
         $group: {
            _id: "$bookingStatus",
            count: { $sum: 1 },
         },
         },
         {
         $project: {
            _id: 0,
            status: "$_id",
            count: 1,
         },
         },
      ]);

      return { statuses: result };
   }



   // FOR HOST DASHBOARDS ___________________________________________________
   async getHostEventsByStatus(
      hostId: string,
      range: DashboardDateRange
   ): Promise<HostEventsByStatusDTO> {
      const result = await Event.aggregate([
         {
            $match: {
               hostRef: new Types.ObjectId(hostId),
               createdAt: { $gte: range.start, $lte: range.end }, // optional
            },
         },
         {
            $group: {
            _id: "$eventStatus",
            count: { $sum: 1 },
            },
         },
         {
            $project: {
               _id: 0,
               status: "$_id",
               count: 1,
            },
         },
         { $sort: { count: -1 } },
      ]);

      return { statuses: result };
   }

   async getHostEventsByCategory(
      hostId: string,
      range: DashboardDateRange
   ): Promise<HostEventsByCategoryDTO> {
      const result = await Event.aggregate([
         {
            $match: {
               hostRef: new Types.ObjectId(hostId),
               createdAt: { $gte: range.start, $lte: range.end }, // optional
            },
         },
         {
            $group: {
               _id: "$category",
               value: { $sum: 1 },
            },
         },
         {
            $project: {
               _id: 0,
               name: "$_id",
               value: 1,
            },
         },
         { $sort: { value: -1 } },
      ]);

      return { categories: result };
   }

   async getHostTicketsSoldChart(
      hostId: string,
      range: DashboardDateRange
   ): Promise<HostTicketsSoldChartDTO> {
      // Tickets sold based on bookings of this host's events
      const result = await Booking.aggregate([
         {
            $match: {
               createdAt: { $gte: range.start, $lte: range.end },
               bookingStatus: {
                  $in: [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.ATTENDED],
               },
            },
         },
         {
            $lookup: {
               from: "events",
               localField: "eventRef",
               foreignField: "_id",
               as: "event",
            },
         },
         { $unwind: "$event" },
         {
            $match: {
               "event.hostRef": new Types.ObjectId(hostId),
            },
         },
         {
            $group: {
               _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
               },
               value: { $sum: "$quantity" },
            },
         },
         { $sort: { _id: 1 } },
         {
            $project: {
               _id: 0,
               label: "$_id",
               value: 1,
            },
         },
      ]);

      return { points: result };
   }

   async getHostRatingDistribution(
      hostId: string
   ): Promise<HostRatingDistributionDTO> {
      const result = await Review.aggregate([
         {
            $match: {
               hostRef: new Types.ObjectId(hostId),
            },
         },
         {
            $group: {
               _id: "$rating",
               count: { $sum: 1 },
            },
         },
         {
            $project: {
               _id: 0,
               rating: "$_id",
               count: 1,
            },
         },
         { $sort: { rating: 1 } },
      ]);

      // Ensure all ratings 1-5 exist (fill missing with 0)
      const distribution = [1, 2, 3, 4, 5].map((r) => {
         const found = result.find((item) => item.rating === r);
         return {
            rating: r,
            count: found ? found.count : 0,
         };
      });

      return { distribution };
   }


   // FOR ADMIN DASHBOARDS ___________________________________________________
   async getAdminOverview(
      range: DashboardDateRange
   ): Promise<AdminDashboardOverviewDTO> {
      const [
         userStats,
         hostStats,
         eventStats,
         bookingCount,
         revenueStats,
         payoutStats,
         ratingStats,
      ] = await Promise.all([
         User.aggregate([
         {
            $facet: {
               total: [{ $count: "count" }],
               active: [
                  { $match: { status: USER_STATUS.ACTIVE } },
                  { $count: "count" },
               ],
            },
         },
         ]),

         User.aggregate([
         {
            $facet: {
               totalHosts: [
                  { $match: { role: USER_ROLES.HOST } },
                  { $count: "count" },
               ],
               pending: [
                  { $match: { hostStatus: HOST_STATUS.PENDING } },
                  { $count: "count" },
               ],
            },
         },
         ]),

         Event.aggregate([
         {
            $facet: {
               total: [{ $count: "count" }],
               published: [
                  { $match: { eventStatus: EVENT_STATUSES.PUBLISHED } },
                  { $count: "count" },
               ],
            },
         },
         ]),

         Booking.countDocuments({
            createdAt: { $gte: range.start, $lte: range.end },
         }),

         Booking.aggregate([
         {
            $match: {
               createdAt: { $gte: range.start, $lte: range.end },
               bookingStatus: {
                  $in: [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.ATTENDED],
               },
            },
         },
         {
            $group: {
               _id: null,
               gross: { $sum: "$totalAmount" },
            },
         },
         ]),

         PayoutRequestModel.aggregate([
         {
            $match: { status: PAYOUT_REQUEST_STATUSES.PENDING },
         },
         {
            $group: {
               _id: null,
               count: { $sum: 1 },
               amount: { $sum: "$netAmount" },
            },
         },
         ]),

         Event.aggregate([
         {
            $match: { totalReviews: { $gt: 0 } },
         },
         {
            $group: {
               _id: null,
               avg: { $avg: "$ratingAverage" },
            },
         },
         ]),
      ]);

      const u = userStats[0];
      const h = hostStats[0];
      const e = eventStats[0];

      return {
         totalUsers: u?.total[0]?.count ?? 0,
         activeUsers: u?.active[0]?.count ?? 0,
         totalHosts: h?.totalHosts[0]?.count ?? 0,
         pendingHostApplications: h?.pending[0]?.count ?? 0,
         totalEvents: e?.total[0]?.count ?? 0,
         publishedEvents: e?.published[0]?.count ?? 0,
         totalBookings: bookingCount,
         grossRevenue: revenueStats[0]?.gross ?? 0,
         platformCommission: 0, // enriched in service
         pendingPayoutsCount: payoutStats[0]?.count ?? 0,
         pendingPayoutsAmount: payoutStats[0]?.amount ?? 0,
         averageEventRating: Number((ratingStats[0]?.avg ?? 0).toFixed(2)),
      };
   }

   async getAdminRevenueChart(
      range: DashboardDateRange
   ): Promise<AdminRevenueChartDTO> {
      const result = await Booking.aggregate([
         {
         $match: {
            createdAt: { $gte: range.start, $lte: range.end },
            bookingStatus: {
               $in: [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.ATTENDED],
            },
         },
         },
         {
         $group: {
            _id: {
               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            value: { $sum: "$totalAmount" },
         },
         },
         { $sort: { _id: 1 } },
         {
         $project: {
            _id: 0,
            label: "$_id",
            value: 1,
         },
         },
      ]);

      return { points: result };
   }

   async getAdminUserGrowthChart(
      range: DashboardDateRange
   ): Promise<AdminUserGrowthChartDTO> {
      const result = await User.aggregate([
         {
            $match: {
               createdAt: { $gte: range.start, $lte: range.end },
            },
         },
         {
            $group: {
               _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
               },
               value: { $sum: 1 },
            },
         },
         { $sort: { _id: 1 } },
         {
            $project: {
               _id: 0,
               label: "$_id",
               value: 1,
            },
         },
      ]);

      return { points: result };
   }

   async getAdminEventsByCategory(
      range: DashboardDateRange
   ): Promise<AdminEventsByCategoryDTO> {
      const result = await Event.aggregate([
         {
            $match: {
               createdAt: { $gte: range.start, $lte: range.end },
            },
         },
         {
            $group: {
               _id: "$category",
               value: { $sum: 1 },
            },
         },
         {
            $project: {
               _id: 0,
               name: "$_id",
               value: 1,
            },
         },
         { $sort: { value: -1 } },
      ]);

      return { categories: result };
   }

   async getAdminEventsByStatus(
      range: DashboardDateRange
   ): Promise<AdminEventsByStatusDTO> {
      const result = await Event.aggregate([
         {
            $match: {
               createdAt: { $gte: range.start, $lte: range.end },
            },
         },
         {
            $group: {
               _id: "$eventStatus",
               count: { $sum: 1 },
            },
         },
         {
            $project: {
               _id: 0,
               status: "$_id",
               count: 1,
            },
         },
      ]);

      return { statuses: result };
   }

   async getAdminTopHosts(
      range: DashboardDateRange,
      limit = 10
   ): Promise<AdminTopHostsDTO> {
      const result = await Event.aggregate([
         {
            $match: {
               createdAt: { $gte: range.start, $lte: range.end },
               eventStatus: {
                  $in: [EVENT_STATUSES.PUBLISHED, EVENT_STATUSES.COMPLETED],
               },
            },
         },
         {
            $group: {
               _id: "$hostRef",
               revenue: { $sum: "$grossTicketRevenue" },
               ratingSum: {
                  $sum: { $multiply: ["$ratingAverage", "$totalReviews"] },
               },
               reviewCount: { $sum: "$totalReviews" },
            },
         },
         {
            $lookup: {
               from: "users",
               localField: "_id",
               foreignField: "_id",
               as: "host",
            },
         },
         { $unwind: "$host" },
         {
            $project: {
               hostId: { $toString: "$_id" },
               name: "$host.name",
               organizationName: "$host.organizationName",
               revenue: 1,
               rating: {
                  $cond: [
                  { $gt: ["$reviewCount", 0] },
                  { $divide: ["$ratingSum", "$reviewCount"] },
                  0,
                  ],
               },
            },
         },
         { $sort: { revenue: -1 } },
         { $limit: limit },
      ]);

      return {
         hosts: result.map((h) => ({
            hostId: h.hostId,
            name: h.name ?? "Unknown",
            organizationName: h.organizationName ?? null,
            revenue: h.revenue,
            rating: Number(h.rating.toFixed(2)),
         })),
      };
   }
}