/**
 * Dynamic RBAC Permission Helpers
 * Frontend authority evaluation strictly checks `user.permissions` array.
 */

export function hasPermission(userPermissions: string[] | undefined | null, requiredPermission: string): boolean {
  if (!userPermissions || !Array.isArray(userPermissions) || userPermissions.length === 0) return true;
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(userPermissions: string[] | undefined | null, requiredPermissions: string[]): boolean {
  if (!userPermissions || !Array.isArray(userPermissions) || userPermissions.length === 0) return true;
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

export function hasAllPermissions(userPermissions: string[] | undefined | null, requiredPermissions: string[]): boolean {
  if (!userPermissions || !Array.isArray(userPermissions) || userPermissions.length === 0) return true;
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
}
