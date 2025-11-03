import type { components } from "@/schema-from-be";

// ==================== ORDER TYPES ====================

/**
 * Order type from backend schema
 */
export type Order = components["schemas"]["Orders"];

/**
 * Order status enum
 */
export type OrderStatus = "PENDING" | "COMPLETED" | "PAID" | "CANCELLED";

/**
 * Order update DTO
 */
export type OrderUpdateDto = components["schemas"]["OrderUpdateDto"];

/**
 * Make order request (for creating new orders)
 */
export type MakeOrderRequest = components["schemas"]["MakeOrderRequest"];

/**
 * Order item DTO (used in MakeOrderRequest)
 */
export type OrderItemDTO = components["schemas"]["OrderItemDTO"];

/**
 * Recipe item DTO (used in OrderItemDTO)
 */
export type RecipeItemDTO = components["schemas"]["RecipeItemDTO"];

/**
 * Order detail type (individual items in an order)
 */
export type OrderDetail = components["schemas"]["OrderDetail"];

/**
 * Feedback DTO
 */
export type FeedbackDto = components["schemas"]["FeedbackDto"];
