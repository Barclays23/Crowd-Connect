// backend/src/constants/user-system.constants.ts


// --- Values ---
export const USER_ROLES = {
  USER: 'user',
  HOST: 'host',
  ADMIN: 'admin',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  PENDING: 'pending',
} as const;

export const HOST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
} as const;



// can only create role 'User' or 'Admin'
// creating 'Host' allowed only after making the role conversion payment.
export const ALLOWED_CREATE_ROLES: UserRole[] = [USER_ROLES.USER, USER_ROLES.ADMIN];



// --- Types ---
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export type HostStatus = typeof HOST_STATUS[keyof typeof HOST_STATUS];