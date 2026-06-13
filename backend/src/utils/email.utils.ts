// backend/src/utils/email.utils.ts

export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }

  const normalized = email.trim().toLowerCase();

  if (!normalized.includes('@')) {
    throw new Error('Invalid email format');
  }

  return normalized;
}