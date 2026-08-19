// frontend/src/components/checkin/ScanErrorCard.tsx

import { Button } from "@/components/ui/button";
import { RefreshCw, XCircle } from "lucide-react";




export function ScanErrorCard({ code, message, onScanAgain }: {
    code: string;
    message: string;
    onScanAgain: () => void;
}) {
    return (
        <div className="rounded-xl border border-(--badge-error-border) bg-(--badge-error-bg) p-5 space-y-3">
            <div className="flex items-center gap-2">
                <XCircle size={20} className="text-(--status-error)" />
                <p className="font-bold text-(--status-error)">Entry Denied</p>
            </div>
            <p className="text-sm text-(--text-secondary)">{message}</p>
            <p className="text-xs text-(--text-tertiary) font-mono">{code}</p>
            <Button size="sm" variant="outline" onClick={onScanAgain} className="gap-2 w-full">
                <RefreshCw size={13} />
                Try Again
            </Button>
        </div>
    );
}