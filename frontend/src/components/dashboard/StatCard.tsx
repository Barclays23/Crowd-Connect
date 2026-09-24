// frontend/src/components/dashboard/StatCard.tsx
import type { LucideIcon } from "lucide-react";

export type StatAccent =
  | "coral"
  | "violet"
  | "blue"
  | "amber"
  | "emerald"
  | "purple"
  | "teal";

const ACCENT_MAP: Record<StatAccent, { fg: string; bg: string; bar: string }> = {
  coral: { fg: "var(--brand-primary)", bg: "var(--badge-primary-bg)", bar: "var(--brand-primary)" },
  violet: { fg: "var(--accent-violet)", bg: "var(--accent-violet-bg)", bar: "var(--accent-violet)" },
  blue: { fg: "var(--accent-blue)", bg: "var(--accent-blue-bg)", bar: "var(--accent-blue)" },
  amber: { fg: "var(--accent-amber)", bg: "var(--accent-amber-bg)", bar: "var(--accent-amber)" },
  emerald: { fg: "var(--accent-emerald)", bg: "var(--accent-emerald-bg)", bar: "var(--accent-emerald)" },
  purple: { fg: "var(--accent-purple)", bg: "var(--accent-purple-bg)", bar: "var(--accent-purple)" },
  teal: { fg: "var(--accent-teal)", bg: "var(--accent-teal-bg)", bar: "var(--accent-teal)" },
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: StatAccent;
}

const StatCard = ({ title, value, subtitle, icon: Icon, accent = "coral" }: StatCardProps) => {
  const colors = ACCENT_MAP[accent];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-(--border-default) bg-(--card-bg) p-5 shadow-(--shadow-sm) transition-all duration-200 hover:shadow-(--shadow-md) hover:-translate-y-0.5">
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: colors.bar }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-(--text-secondary)">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-(--heading-primary) sm:text-[1.75rem]">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 truncate text-xs text-(--text-tertiary)">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: colors.bg, color: colors.fg }}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;