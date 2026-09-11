// src/lib/notification-display-utils.ts
//
// Maps each backend NOTIFICATION_TYPES value to a lucide-react icon and a
// semantic "tone" (success / error / warning / info / neutral). Tones map to
// the --badge-*-bg / --badge-*-text variables already defined in index.css,
// so icons automatically pick up the right colors in both light and dark mode.
//
// Keys are written as plain strings (matching the enum's string values) so
// this file has no dependency on the backend package. If you have a shared
// types package, feel free to swap these string keys for the real
// NOTIFICATION_TYPES enum.


import type { LucideIcon } from "lucide-react";
import {
  UserPlus,
  UserX,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  MailCheck,
  Building2,
  BadgeCheck,
  Inbox,
  CalendarCheck,
  CalendarX,
  CreditCard,
  Banknote,
  PauseCircle,
  AlertTriangle,
  BellRing,
  Pencil,
  Trash2,
  PartyPopper,
  Wallet,
  Gift,
  PiggyBank,
  Star,
  Bell,
} from "lucide-react";

export type NotificationTone = "success" | "error" | "warning" | "info" | "neutral";

interface NotificationDisplayMeta {
  icon: LucideIcon;
  tone: NotificationTone;
}

const NOTIFICATION_DISPLAY_MAP: Record<string, NotificationDisplayMeta> = {
  // ── Auth & Account ──────────────────────────────────────────
  ACCOUNT_CREATED_BY_ADMIN: { icon: UserPlus, tone: "success" },
  ACCOUNT_BLOCKED: { icon: UserX, tone: "error" },
  ACCOUNT_UNBLOCKED: { icon: UserCheck, tone: "success" },
  ACCOUNT_SUSPENDED: { icon: ShieldAlert, tone: "error" },
  ACCOUNT_REACTIVATED: { icon: ShieldCheck, tone: "success" },
  PASSWORD_CHANGED: { icon: KeyRound, tone: "info" },
  PASSWORD_RESET_COMPLETED: { icon: KeyRound, tone: "info" },
  EMAIL_VERIFICATION: { icon: MailCheck, tone: "info" },

  // ── Host application ────────────────────────────────────────
  HOST_REQUEST_SUBMITTED: { icon: Building2, tone: "info" },
  HOST_REQUEST_APPROVED: { icon: BadgeCheck, tone: "success" },
  HOST_REQUEST_REJECTED: { icon: Building2, tone: "error" },
  HOST_REQUEST_RECEIVED: { icon: Inbox, tone: "info" },

  // ── Booking ─────────────────────────────────────────────────
  BOOKING_CONFIRMED: { icon: CalendarCheck, tone: "success" },
  BOOKING_PAYMENT_FAILED: { icon: CreditCard, tone: "error" },
  BOOKING_CANCELLED_BY_USER: { icon: CalendarX, tone: "error" },
  BOOKING_CANCELLED_BY_AUTHORITY: { icon: CalendarX, tone: "error" },
  BOOKING_REFUND_PROCESSED: { icon: Banknote, tone: "success" },

  // ── Event → Attendees ───────────────────────────────────────
  EVENT_CANCELLED: { icon: CalendarX, tone: "error" },
  EVENT_SUSPENDED: { icon: PauseCircle, tone: "warning" },
  EVENT_MAJOR_CHANGE: { icon: AlertTriangle, tone: "warning" },
  EVENT_REMINDER: { icon: BellRing, tone: "info" },

  // ── Event → Host ────────────────────────────────────────────
  EVENT_SUSPENDED_HOST: { icon: PauseCircle, tone: "warning" },
  EVENT_UPDATED_BY_ADMIN: { icon: Pencil, tone: "info" },
  EVENT_DELETED_BY_ADMIN: { icon: Trash2, tone: "error" },
  EVENT_PUBLISHED: { icon: PartyPopper, tone: "success" },

  // ── Payout ──────────────────────────────────────────────────
  PAYOUT_REQUESTED: { icon: Wallet, tone: "info" },
  PAYOUT_REJECTED: { icon: Wallet, tone: "error" },
  PAYOUT_APPROVED: { icon: Wallet, tone: "success" },
  PAYOUT_PAID: { icon: Banknote, tone: "success" },
  PAYOUT_REQUEST_RECEIVED: { icon: Inbox, tone: "info" },

  // ── Referral & Cashback ─────────────────────────────────────
  REFERRAL_CREDIT: { icon: Gift, tone: "success" },
  CASHBACK_RECEIVED: { icon: PiggyBank, tone: "success" },

  // ── Review ──────────────────────────────────────────────────
  NEW_REVIEW_RECEIVED: { icon: Star, tone: "warning" },
};

const TONE_CLASSES: Record<NotificationTone, { bg: string; text: string }> = {
  success: { bg: "bg-(--bg-neutral)", text: "text-(--badge-success-text)" },
  error: { bg: "bg-(--bg-neutral)", text: "text-(--badge-error-text)" },
  warning: { bg: "bg-(--bg-neutral)", text: "text-(--badge-warning-text)" },
  info: { bg: "bg-(--bg-neutral)", text: "text-(--badge-info-text)" },
  neutral: { bg: "bg-(--bg-neutral)", text: "text-(--badge-secondary-text)" },
};

/** Returns the icon component + tailwind color classes for a given notification type. */
export function getNotificationDisplay(type?: string | null) {
  const meta = (type && NOTIFICATION_DISPLAY_MAP[type]) || { icon: Bell, tone: "neutral" as NotificationTone };
  const classes = TONE_CLASSES[meta.tone];
  return { Icon: meta.icon, ...classes };
}

/** Lightweight relative time formatter (no extra dependency required). */
export function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(days / 365);
  return `${years}y ago`;
}