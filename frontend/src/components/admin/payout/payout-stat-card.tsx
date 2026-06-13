// frontend/src/components/admin/payout/payout-stat-card.tsx

import React from "react";

interface StatCardProps {
   icon: React.ReactNode; 
   label: string; 
   value: string; 
   sub?: string;
}

export function PayoutStatCard({ icon, label, value, sub }: StatCardProps) {
   return (
      <div className="rounded-xl p-4 flex flex-col gap-1.5 bg-(--bg-secondary) border border-(--card-border)">
         <div className="flex items-center gap-1.5 text-(--brand-primary) text-[11px] font-bold uppercase tracking-[0.08em]">
            {icon} {label}
         </div>
         <div className="text-lg font-extrabold text-(--text-primary)">{value}</div>
         {sub && <div className="text-xs text-(--text-tertiary)">{sub}</div>}
      </div>
   );
}