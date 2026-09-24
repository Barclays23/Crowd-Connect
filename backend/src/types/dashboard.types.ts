// backend/src/types/dashboard.types.ts

export type DashboardPreset = "week" | "month" | "year" | "custom";

export interface DashboardDateFilter {
  preset?: DashboardPreset;
  from?: string; // ISO date string (YYYY-MM-DD)
  to?: string;   // ISO date string (YYYY-MM-DD)
}

export interface DashboardDateRange {
  start: Date;
  end: Date;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface StatusCount {
  status: string;
  count: number;
}