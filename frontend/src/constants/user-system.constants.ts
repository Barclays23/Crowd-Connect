// frontend/src/constants/user-system.constants.ts
export const USER_ROLES = {
  USER : 'user',
  HOST : 'host',
  ADMIN : 'admin',
} as const;

export const USER_STATUS = {
  ACTIVE : 'active',
  BLOCKED : 'blocked',
  PENDING : 'pending',
} as const;

export const HOST_STATUS = {
  PENDING : 'pending',
  APPROVED : 'approved',
  REJECTED : 'rejected',
  BLOCKED : 'blocked',
} as const;



export type UserRole    = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatus  = typeof USER_STATUS[keyof typeof USER_STATUS];
export type HostStatus  = typeof HOST_STATUS[keyof typeof HOST_STATUS];