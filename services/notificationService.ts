import type {
  Notification,
  NotificationCreateRequest,
  NotificationUpdateRequest,
} from "@/interfaces/notification.interface";
import { $api } from "@/libs/api";

// ==================== NOTIFICATION API HOOKS ====================

/**
 * Hook for getting all notifications
 * Uses GET /api/notifications endpoint
 */
export const useNotifications = () => {
  return $api.useQuery("get", "/api/notifications", {});
};

/**
 * Hook for getting notification by ID
 * Uses GET /api/notifications/{id} endpoint
 */
export const useGetNotificationById = (id: number) => {
  return $api.useQuery("get", "/api/notifications/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for getting notifications by account ID
 * Uses GET /api/notifications/account/{id} endpoint
 */
export const useGetNotificationsByAccountId = (id: number) => {
  return $api.useQuery("get", "/api/notifications/account/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new notification
 * Uses POST /api/notifications endpoint
 */
export const useCreateNotification = () => {
  return $api.useMutation("post", "/api/notifications");
};

/**
 * Hook for updating an existing notification
 * Uses PUT /api/notifications endpoint
 */
export const useUpdateNotification = () => {
  return $api.useMutation("put", "/api/notifications");
};

/**
 * Hook for deleting a notification
 * Uses DELETE /api/notifications/{id} endpoint
 */
export const useDeleteNotification = () => {
  return $api.useMutation("delete", "/api/notifications/{id}");
};

/**
 * Hook for marking a notification as read
 * Uses PATCH /api/notifications/{id}/read endpoint
 */
export const useMarkAsRead = () => {
  return $api.useMutation("patch", "/api/notifications/{id}/read");
};

// ==================== TRANSFORM FUNCTIONS ====================

/**
 * Transform notification form data to create request format
 */
export const transformNotificationCreateRequest = (data: {
  title: string;
  message: string;
  accountId: number;
}): NotificationCreateRequest => {
  return {
    title: data.title,
    message: data.message,
    account: {
      id: data.accountId,
      name: "", // Will be filled by backend
      mail: "", // Will be filled by backend
      role: "USER", // Will be filled by backend
    },
    read: false,
  };
};

/**
 * Transform notification form data to update request format
 */
export const transformNotificationUpdateRequest = (
  notification: Notification
): NotificationUpdateRequest => {
  return notification;
};
