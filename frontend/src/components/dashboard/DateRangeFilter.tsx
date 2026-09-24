// frontend/src/components/dashboard/DateRangeFilter.tsx
import { useState } from "react";
import type { DashboardDateFilter, DashboardPreset } from "@/types/dashboard.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DateRangeFilterProps {
  value: DashboardDateFilter;
  onChange: (filter: DashboardDateFilter) => void;
}

const PRESETS: { label: string; value: DashboardPreset }[] = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "Custom", value: "custom" },
];

const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  const [showCustom, setShowCustom] = useState(value.preset === "custom");

  // Today's date in YYYY-MM-DD format (local timezone)
  const today = new Date().toISOString().split("T")[0];

  const handlePreset = (preset: DashboardPreset) => {
    if (preset === "custom") {
      setShowCustom(true);
      onChange({ preset: "custom", from: value.from, to: value.to });
    } else {
      setShowCustom(false);
      onChange({ preset });
    }
  };

  const handleFromChange = (from: string) => {
    // Prevent future dates
    if (from > today) return;

    // If "to" is earlier than the new "from", reset "to"
    const newTo = value.to && value.to < from ? from : value.to;

    onChange({
      ...value,
      preset: "custom",
      from,
      to: newTo,
    });
  };

  const handleToChange = (to: string) => {
    // Prevent future dates
    if (to > today) return;

    // "to" cannot be earlier than "from"
    if (value.from && to < value.from) return;

    onChange({
      ...value,
      preset: "custom",
      to,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1 rounded-lg border border-(--border-default) bg-(--card-bg) p-1">
        {PRESETS.map((p) => (
          <Button
            key={p.value}
            type="button"
            size="sm"
            variant={value.preset === p.value ? "default" : "ghost"}
            onClick={() => handlePreset(p.value)}
            className="h-8"
          >
            {p.label}
          </Button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={value.from ?? ""}
            max={today}
            onChange={(e) => handleFromChange(e.target.value)}
            className="h-9 w-35"
          />
          <span className="text-sm text-(--text-tertiary)">to</span>
          <Input
            type="date"
            value={value.to ?? ""}
            max={today}
            min={value.from || undefined}
            onChange={(e) => handleToChange(e.target.value)}
            className="h-9 w-35"
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;