import { ROLES, type ROLE_TYPE } from "@/interfaces/role.interface";

/**
 * Determines the appropriate route based on user role
 * ADMIN & STAFF -> (tabs)/manager
 * USER -> (tabs)/home
 */
export function getRoleBasedRoute(role: ROLE_TYPE): string {
  switch (role) {
    case ROLES.ADMIN:
    case ROLES.STAFF:
      return "/(tabs)/manager";
    case ROLES.USER:
    default:
      return "/(tabs)/home";
  }
}

/**
 * Checks if a role has access to manager features
 */
export function canAccessManager(role: ROLE_TYPE): boolean {
  return role === ROLES.ADMIN || role === ROLES.STAFF;
}

/**
 * Checks if a role has access to user features
 */
export function canAccessHome(role: ROLE_TYPE): boolean {
  return role === ROLES.USER;
}
