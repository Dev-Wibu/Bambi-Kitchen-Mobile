import { ROLES, type ROLE_TYPE } from "@/interfaces/role.interface";

/**
 * Determines the appropriate route based on user role
 * ADMIN -> /manager (mobile manager interface with tabs)
 * STAFF -> blocked on mobile (returns null)
 * USER -> (tabs)/home
 */
export function getRoleBasedRoute(role: ROLE_TYPE): string | null {
  switch (role) {
    case ROLES.ADMIN:
      return "/manager";
    case ROLES.STAFF:
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
  return role === ROLES.ADMIN;
}

/**
 * Checks if a role has access to user features
 */
export function canAccessHome(role: ROLE_TYPE): boolean {
  return role === ROLES.USER;
}
