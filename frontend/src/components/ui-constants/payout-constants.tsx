// frontend/src/components/ui-constants/payout-constants.tsx

import React from "react";
import { Clock, BadgeCheck, Wallet, Ban } from "lucide-react";
import type { PayoutRequestStatus } from "@/types/payout.types";

export const PAYOUT_STATUS_BADGE: Record<PayoutRequestStatus, "default" | "secondary" | "success" | "destructive" | "outline"> = {
   pending  : "secondary",
   approved : "success",
   paid     : "success",
   rejected : "destructive",
};

export const PAYOUT_STATUS_ICON: Record<PayoutRequestStatus, React.ReactNode> = {
   pending  : <Clock       className="h-3 w-3" />,
   approved : <BadgeCheck  className="h-3 w-3" />,
   paid     : <Wallet      className="h-3 w-3" />,
   rejected : <Ban         className="h-3 w-3" />,
};