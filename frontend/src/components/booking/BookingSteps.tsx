import { CheckCircle } from "lucide-react";



export function BookingSteps({ step }: { step: 1 | 2 }) {
   const steps = ["Select Tickets", "Confirm"] as const;
   return (
      <div className="flex items-center mb-6">
         {steps.map((label, i) => {
         const idx    = i + 1;
         const active = idx === step;
         const done   = idx < step;
         return (
            <div key={label} className="flex items-center flex-1">
               <div className="flex flex-col items-center gap-1 flex-shrink-0">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${done   ? "bg-(--status-success) text-(--text-inverse)"
                     : active ? "bg-(--brand-primary) text-(--btn-primary-text)"
                     :          "bg-(--bg-tertiary) text-(--text-tertiary)"}`}
               >
                  {done ? <CheckCircle size={16} /> : idx}
               </div>
               <span className={`text-xs whitespace-nowrap ${active ? "text-(--brand-primary) font-medium" : "text-(--text-tertiary)"}`}>
                  {label}
               </span>
               </div>
               {i < steps.length - 1 && (
               <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${done ? "bg-(--status-success)" : "bg-(--border-muted)"}`} />
               )}
            </div>
         );
         })}
      </div>
   );
}