// frontend/src/pages/admin/AdminDashboard.tsx
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
  Users,
  UserCheck,
  Building2,
  ClipboardList,
  CalendarDays,
  CalendarCheck2,
  Ticket,
  Banknote,
  Percent,
  Clock,
  Star,
  TrendingUp,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminBanner from "@/components/layout/admin-banner";
import { dashboardServices } from "@/services/dashboardServices";
import type {
  DashboardDateFilter,
  AdminDashboardOverviewDTO,
  AdminRevenueChartDTO,
  AdminUserGrowthChartDTO,
  AdminEventsByCategoryDTO,
  AdminEventsByStatusDTO,
  AdminTopHostsDTO,
} from "@/types/dashboard.types";
import StatCard from "@/components/dashboard/StatCard";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";

const CATEGORY_COLORS = [
  "var(--brand-primary)",
  "var(--accent-violet)",
  "var(--accent-blue)",
  "var(--accent-amber)",
  "var(--accent-teal)",
  "var(--accent-purple)",
];

const RANK_COLORS = ["var(--accent-amber)", "var(--text-tertiary)", "var(--accent-orange, var(--brand-primary))"];

const AdminDashboard = () => {
  const [filter, setFilter] = useState<DashboardDateFilter>({ preset: "month" });

  const [overview, setOverview] = useState<AdminDashboardOverviewDTO | null>(null);
  const [revenueChart, setRevenueChart] = useState<AdminRevenueChartDTO | null>(null);
  const [growthChart, setGrowthChart] = useState<AdminUserGrowthChartDTO | null>(null);
  const [categoryChart, setCategoryChart] = useState<AdminEventsByCategoryDTO | null>(null);
  const [statusChart, setStatusChart] = useState<AdminEventsByStatusDTO | null>(null);
  const [topHosts, setTopHosts] = useState<AdminTopHostsDTO | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const [overviewRes, revenueRes, growthRes, categoryRes, statusRes, topHostsRes] =
          await Promise.all([
            dashboardServices.getAdminOverview(filter),
            dashboardServices.getAdminRevenueChart(filter),
            dashboardServices.getAdminUserGrowthChart(filter),
            dashboardServices.getAdminEventsByCategory(filter),
            dashboardServices.getAdminEventsByStatus(filter),
            dashboardServices.getAdminTopHosts(filter),
          ]);

        if (cancelled) return;

        setOverview(overviewRes.data);
        setRevenueChart(revenueRes.data);
        setGrowthChart(growthRes.data);
        setCategoryChart(categoryRes.data);
        setStatusChart(statusRes.data);
        setTopHosts(topHostsRes.data);
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load admin dashboard data. Please try again.");
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

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <AdminBanner
          title="Welcome to Crowd Connect Admin"
          description="Manage users, events, bookings and more from your comprehensive dashboard"
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-(--heading-primary) sm:text-3xl">
            Platform Overview
          </h2>
          <DateRangeFilter value={filter} onChange={setFilter} />
        </div>

        {error && (
          <div className="rounded-lg border border-(--badge-error-border) bg-(--badge-error-bg) px-4 py-3 text-sm text-(--badge-error-text)">
            {error}
          </div>
        )}

        {/* Users */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-(--text-tertiary)">
            Users &amp; Hosts
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Users" value={loading ? "..." : overview?.totalUsers ?? 0} icon={Users} accent="violet" />
            <StatCard title="Active Users" value={loading ? "..." : overview?.activeUsers ?? 0} icon={UserCheck} accent="blue" />
            <StatCard title="Total Hosts" value={loading ? "..." : overview?.totalHosts ?? 0} icon={Building2} accent="teal" />
            <StatCard title="Pending Host Apps" value={loading ? "..." : overview?.pendingHostApplications ?? 0} icon={ClipboardList} accent="amber" />
          </div>
        </section>

        {/* Events & Bookings */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-(--text-tertiary)">
            Events &amp; Bookings
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Events" value={loading ? "..." : overview?.totalEvents ?? 0} icon={CalendarDays} accent="coral" />
            <StatCard title="Published Events" value={loading ? "..." : overview?.publishedEvents ?? 0} icon={CalendarCheck2} accent="violet" />
            <StatCard title="Total Bookings" value={loading ? "..." : overview?.totalBookings ?? 0} icon={Ticket} accent="blue" />
            <StatCard title="Avg Event Rating" value={loading ? "..." : overview?.averageEventRating ?? 0} icon={Star} accent="amber" />
          </div>
        </section>

        {/* Revenue */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-(--text-tertiary)">
            Revenue &amp; Payouts
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Gross Revenue"
              value={loading ? "..." : `₹${(overview?.grossRevenue ?? 0).toLocaleString()}`}
              icon={TrendingUp}
              accent="emerald"
            />
            <StatCard
              title="Platform Commission"
              value={loading ? "..." : `₹${(overview?.platformCommission ?? 0).toLocaleString()}`}
              icon={Percent}
              accent="teal"
            />
            <StatCard
              title="Pending Payouts"
              value={loading ? "..." : overview?.pendingPayoutsCount ?? 0}
              subtitle={`₹${(overview?.pendingPayoutsAmount ?? 0).toLocaleString()}`}
              icon={Banknote}
              accent="purple"
            />
          </div>
        </section>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Revenue */}
          <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent-emerald-bg) text-(--accent-emerald)">
                <LineChartIcon className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
                Revenue Over Time
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueChart?.points ?? []}>
                <defs>
                  <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-emerald)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--accent-emerald)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={{ stroke: "var(--border-muted)" }} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border-default)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--accent-emerald)" strokeWidth={2} fill="url(#adminRevenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth */}
          <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent-violet-bg) text-(--accent-violet)">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
                User Growth
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={growthChart?.points ?? []}>
                <defs>
                  <linearGradient id="adminGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-violet)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--accent-violet)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={{ stroke: "var(--border-muted)" }} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border-default)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--accent-violet)" strokeWidth={2} fill="url(#adminGrowthGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Events by Category */}
          <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent-blue-bg) text-(--accent-blue)">
                <PieChartIcon className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
                Events by Category
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryChart?.categories ?? []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {(categoryChart?.categories ?? []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Events by Status */}
          <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent-amber-bg) text-(--accent-amber)">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
                Events by Status
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusChart?.statuses ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
                <XAxis dataKey="status" tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={{ stroke: "var(--border-muted)" }} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border-default)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                  }}
                />
                <Bar dataKey="count" fill="var(--accent-amber)" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Hosts */}
        <div className="rounded-xl border border-(--border-default) bg-(--card-bg) p-4 shadow-(--shadow-sm) sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent-purple-bg) text-(--accent-purple)">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-(--heading-primary) sm:text-lg">
              Top Hosts by Revenue
            </h3>
          </div>

          {/* Mobile: stacked cards */}
          <div className="space-y-2 sm:hidden">
            {(topHosts?.hosts ?? []).map((host, i) => (
              <div
                key={host.hostId}
                className="flex items-center gap-3 rounded-lg border border-(--border-default) p-3"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: RANK_COLORS[i] ?? "var(--brand-primary)" }}
                >
                  {initials(host.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-(--text-primary)">{host.name}</p>
                  <p className="truncate text-xs text-(--text-tertiary)">
                    {host.organizationName ?? "—"} · ★ {host.rating}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-(--text-primary)">
                  ₹{host.revenue.toLocaleString()}
                </p>
              </div>
            ))}
            {(topHosts?.hosts ?? []).length === 0 && !loading && (
              <p className="py-6 text-center text-sm text-(--text-tertiary)">
                No data available for the selected period
              </p>
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-(--table-header-border) bg-(--table-header-bg) text-(--table-header-text)">
                <tr>
                  <th className="px-4 py-3 font-medium">Host</th>
                  <th className="px-4 py-3 font-medium">Organization</th>
                  <th className="px-4 py-3 font-medium">Revenue</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {(topHosts?.hosts ?? []).map((host, i) => (
                  <tr
                    key={host.hostId}
                    className="border-b border-(--table-row-border) transition-colors hover:bg-(--table-row-hover)"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: RANK_COLORS[i] ?? "var(--brand-primary)" }}
                        >
                          {initials(host.name)}
                        </div>
                        <span className="text-(--text-primary)">{host.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-(--text-secondary)">
                      {host.organizationName ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-(--text-primary)">
                      ₹{host.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-(--text-primary)">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-(--accent-amber) text-(--accent-amber)" />
                        {host.rating}
                      </span>
                    </td>
                  </tr>
                ))}
                {(topHosts?.hosts ?? []).length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-(--text-tertiary)">
                      No data available for the selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;