export const ROLES = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  STAFF: 'STAFF',
  USER: 'USER',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];
