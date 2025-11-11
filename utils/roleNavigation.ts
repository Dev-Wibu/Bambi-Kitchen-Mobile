import { ROLES, type ROLE_TYPE } from "@/interfaces/role.interface";

/**
 * Determines the appropriate route based on user role
 * STAFF -> /manager (mobile manager interface with tabs)
 * ADMIN -> blocked on mobile (returns null)
 * USER -> (tabs)/home
 */
export function getRoleBasedRoute(role: ROLE_TYPE): string | null {
  switch (role) {
    case ROLES.STAFF:
      return "/manager";
    case ROLES.ADMIN:
      return null; // STAFF is blocked on mobile
    case ROLES.USER:
    default:
      return "/(tabs)/home";
  }
}

/**
 * Checks if a role has access to manager features
 */
export function canAccessManager(role: ROLE_TYPE): boolean {
  return role === ROLES.STAFF;
}

/**
 * Checks if a role has access to user features
 */
export function canAccessHome(role: ROLE_TYPE): boolean {
  return role === ROLES.USER;
}
