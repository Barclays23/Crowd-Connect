// backend/src/constants/roles-and-statuses.ts
export enum UserRole {
  USER = 'user',
  HOST = 'host',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  PENDING = 'pending',
}

export enum HostStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}