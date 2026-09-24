// frontend/src/components/user/user-dashboard/UserDashboard.tsx
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  CalendarCheck,
  CalendarClock,
  CalendarHeart,
  Wallet,
  Receipt,
  TrendingUp,
  Star,
  Banknote,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ListChecks,
  Calendar,
  Ticket,
  Users,
  Percent,
} from "lucide-react";
import { dashboardServices } from "@/services/dashboardServices";
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
} from "@/types/dashboard.types";
import StatCard from "@/components/dashboard/StatCard";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";

const CATEGORY_COLORS = [
  "var(--brand-primary)",
  "var(--accent-violet)",
  "var(--accent-blue)",
  "var(--accent-amber)",
  "var(--accent-teal)",
];

const UserDashboard = () => {
  const [filter, setFilter] = useState<DashboardDateFilter>({ preset: "month" });

  const [overview, setOverview] = useState<UserDashboardOverviewDTO | null>(null);
  const [bookingsChart, setBookingsChart] = useState<UserBookingsChartDTO | null>(null);
  const [spendingChart, setSpendingChart] = useState<UserSpendingChartDTO | null>(null);
  const [categoryChart, setCategoryChart] = useState<UserCategoryChartDTO | null>(null);
  const [statusChart, setStatusChart] = useState<UserStatusChartDTO | null>(null);

  // Host-specific
  const [hostEventsByStatus, setHostEventsByStatus] = useState<HostEventsByStatusDTO | null>(null);
  const [hostEventsByCategory, setHostEventsByCategory] = useState<HostEventsByCategoryDTO | null>(null);
  const [hostTicketsSoldChart, setHostTicketsSoldChart] = useState<HostTicketsSoldChartDTO | null>(null);
  const [hostRatingDistribution, setHostRatingDistribution] = useState<HostRatingDistributionDTO | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isHost =
    overview?.hostGrossRevenue !== null && overview?.hostGrossRevenue !== undefined;

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          overviewRes,
          bookingsRes,
          spendingRes,
          categoryRes,
          statusRes,
        ] = await Promise.all([
          dashboardServices.getUserOverview(filter),
          dashboardServices.getUserBookingsChart(filter),
          dashboardServices.getUserSpendingChart(filter),
          dashboardServices.getUserCategoryChart(filter),
          dashboardServices.getUserStatusChart(filter),
        ]);

        if (cancelled) return;

        setOverview(overviewRes.data);
        setBookingsChart(bookingsRes.data);
        setSpendingChart(spendingRes.data);
        setCategoryChart(categoryRes.data);
        setStatusChart(statusRes.data);

        // Fetch host-specific data only if the user is a host
        const isHostUser =
          overviewRes.data.hostGrossRevenue !== null &&
          overviewRes.data.hostGrossRevenue !== undefined;

        if (isHostUser) {
          const [
            eventsByStatusRes,
            eventsByCategoryRes,
            ticketsSoldRes,
            ratingDistRes,
          ] = await Promise.all([
            dashboardServices.getHostEventsByStatus(filter),
            dashboardServices.getHostEventsByCategory(filter),
            dashboardServices.getHostTicketsSoldChart(filter),
            dashboardServices.getHostRatingDistribution(),
          ]);

          if (cancelled) return;

          setHostEventsByStatus(eventsByStatusRes.data);
          setHostEventsByCategory(eventsByCategoryRes.data);
          setHostTicketsSoldChart(ticketsSoldRes.data);
          setHostRatingDistribution(ratingDistRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load dashboard data. Please try again.");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero */}
      <div
        className="rounded-2xl border border-(--border-default) p-5 sm:p-7"
        style={{ background: "var(--dashboard-hero-bg)" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-(--heading-primary) sm:text-3xl">
              Your Dashboard
            </h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Everything you've booked, spent, and earned in one place
            </p>
          </div>
          <DateRangeFilter value={filter} onChange={setFilter} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-(--badge-error-border) bg-(--badge-error-bg) px-4 py-3 text-sm text-(--badge-error-text)">
          {error}
        </div>
      )}

      {/* ─── Common KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={loading ? "..." : overview?.totalBookings ?? 0}
          icon={ListChecks}
          accent="coral"
        />
        <StatCard
          title="Upcoming Events"
          value={loading ? "..." : overview?.upcomingEvents ?? 0}
          icon={CalendarClock}
          accent="blue"
        />
        <StatCard
          title="Events Attended"
          value={loading ? "..." : overview?.attendedEvents ?? 0}
          icon={CalendarCheck}
          accent="violet"
        />
        <StatCard
          title="Wallet Balance"
          value={loading ? "..." : `₹${(overview?.walletBalance ?? 0).toLocaleString()}`}
          icon={Wallet}
          accent="emerald"
        />
        <StatCard
          title="Total Spent"
          value={loading ? "..." : `₹${(overview?.totalSpent ?? 0).toLocaleString()}`}
          icon={Receipt}
          accent="amber"
        />
      </div>

      {/* ─── Host KPI Cards ───────────────────────────────────────────────── */}
      {isHost && (
        <>
          <div>
            <h3 className="mb-3 text-lg font-semibold text-(--heading-primary)">
              Host Performance
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Events"
                value={loading ? "..." : overview?.hostTotalEvents ?? 0}
                icon={Calendar}
                accent="coral"
              />
              <StatCard
                title="Published Events"
                value={loading ? "..." : overview?.hostPublishedEvents ?? 0}
                icon={CalendarHeart}
                accent="blue"
              />
              <StatCard
                title="Completed Events"
                value={loading ? "..." : overview?.hostCompletedEvents ?? 0}
                icon={CalendarCheck}
                accent="violet"
              />
              <StatCard
                title="Tickets Sold"
                value={loading ? "..." : overview?.hostTotalTicketsSold ?? 0}
                icon={Ticket}
                accent="amber"
              />
              <StatCard
                title="Total Check-ins"
                value={loading ? "..." : overview?.hostTotalCheckIns ?? 0}
                icon={Users}
                accent="teal"
              />
              <StatCard
                title="Attendance Rate"
                value={
                  loading
                    ? "..."
                    : `${overview?.hostAttendanceRate ?? 0}%`
                }
                icon={Percent}
                accent="emerald"
              />
              <StatCard
                title="Gross Revenue"
                value={`₹${(overview?.hostGrossRevenue ?? 0).toLocaleString()}`}
                icon={TrendingUp}
                accent="emerald"
              />
              <StatCard
                title="Net Revenue"
                value={`₹${(overview?.hostNetRevenue ?? 0).toLocaleString()}`}
                icon={Banknote}
                accent="teal"
              />
              <StatCard
                title="Avg Rating"
                value={overview?.hostAverageRating ?? 0}
                subtitle={`${overview?.hostTotalReviews ?? 0} reviews`}
                icon={Star}
                accent="amber"
              />
              <StatCard
                title="Pending Payouts"
                value={`₹${(overview?.pendingPayoutsAmount ?? 0).toLocaleString()}`}
                icon={CalendarHeart}
                accent="purple"
              />
            </div>
          </div>
        </>
      )}

      {/* ─── Common Charts ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Bookings over time */}
        <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--badge-primary-bg) text-(--brand-primary)">
              <LineChartIcon className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
              Bookings Over Time
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={bookingsChart?.points ?? []}>
              <defs>
                <linearGradient id="userBookingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border-muted)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-default)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--brand-primary)"
                strokeWidth={2}
                fill="url(#userBookingsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending over time */}
        <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent-amber-bg) text-(--accent-amber)">
              <Receipt className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
              Spending Over Time
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={spendingChart?.points ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border-muted)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-default)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                }}
              />
              <Bar dataKey="value" fill="var(--accent-amber)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution */}
        <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent-violet-bg) text-(--accent-violet)">
              <PieChartIcon className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
              Bookings by Category
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryChart?.categories ?? []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {(categoryChart?.categories ?? []).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-default)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution */}
        <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent-blue-bg) text-(--accent-blue)">
              <ListChecks className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
              Bookings by Status
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusChart?.statuses ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="status"
                type="category"
                width={90}
                tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-default)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                }}
              />
              <Bar dataKey="count" fill="var(--accent-blue)" radius={[0, 6, 6, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Host Charts ──────────────────────────────────────────────────── */}
      {isHost && (
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-(--heading-primary)">
            Host Insights
          </h3>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Events by Status */}
            <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--badge-primary-bg) text-(--brand-primary)">
                  <PieChartIcon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
                  Events by Status
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={hostEventsByStatus?.statuses ?? []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {(hostEventsByStatus?.statuses ?? []).map((_, index) => (
                      <Cell
                        key={`status-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--border-default)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Events by Category */}
            <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent-violet-bg) text-(--accent-violet)">
                  <PieChartIcon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
                  Events by Category
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={hostEventsByCategory?.categories ?? []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {(hostEventsByCategory?.categories ?? []).map((_, index) => (
                      <Cell
                        key={`cat-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--border-default)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tickets Sold Over Time */}
            <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent-amber-bg) text-(--accent-amber)">
                  <Ticket className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
                  Tickets Sold Over Time
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={hostTicketsSoldChart?.points ?? []}>
                  <defs>
                    <linearGradient id="ticketsSoldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-amber)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--accent-amber)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border-muted)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--border-default)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--accent-amber)"
                    strokeWidth={2}
                    fill="url(#ticketsSoldGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Rating Distribution */}
            <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent-amber-bg) text-(--accent-amber)">
                  <Star className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
                  Rating Distribution
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={hostRatingDistribution?.distribution ?? []}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="rating"
                    type="category"
                    width={40}
                    tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}★`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--border-default)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--accent-amber)"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;