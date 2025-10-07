import type { components } from "@/schema-from-be";

// Notification type from BE schema
export type Notification = components["schemas"]["Notification"];

// For create/update operations, we can use the Notification type directly
export type NotificationCreateRequest = Omit<Notification, "id" | "createdAt">;
export type NotificationUpdateRequest = Notification;
