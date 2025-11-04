import type {
  Notification,
  NotificationCreateRequest,
  NotificationUpdateRequest,
} from "@/interfaces/notification.interface";
import { $api } from "@/libs/api";
import { useMutationHandler } from "@/hooks/useMutationHandler";

// ==================== NOTIFICATION API HOOKS ====================

/**
 * Hook for getting all notifications
 * Uses GET /api/notification endpoint
 */
export const useNotifications = () => {
  return $api.useQuery("get", "/api/notification", {});
};

/**
 * Hook for getting notification by ID
 * Uses GET /api/notification/{id} endpoint
 */
export const useGetNotificationById = (id: number) => {
  return $api.useQuery("get", "/api/notification/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for getting notifications by account ID
 * Uses GET /api/notification/to-account/{id} endpoint
 */
export const useGetNotificationsByAccountId = (id: number) => {
  return $api.useQuery("get", "/api/notification/to-account/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new notification
 * Uses POST /api/notification endpoint
 */
export const useCreateNotification = () => {
  return $api.useMutation("post", "/api/notification");
};

/**
 * Hook for updating an existing notification
 * Uses PUT /api/notification endpoint
 */
export const useUpdateNotification = () => {
  return $api.useMutation("put", "/api/notification");
};

/**
 * Hook for deleting a notification
 * Uses DELETE /api/notification/{id} endpoint
 */
export const useDeleteNotification = () => {
  return $api.useMutation("delete", "/api/notification/{id}");
};

/**
 * Hook for marking a notification as read
 * Uses PATCH /api/notification/{id}/check-read endpoint
 */
export const useMarkAsRead = () => {
  return $api.useMutation("patch", "/api/notification/{id}/check-read");
};

/**
 * Hook for sending notification to a specific user
 * Uses POST /api/notification/send endpoint
 */
export const useSendNotificationToUser = () => {
  return $api.useMutation("post", "/api/notification/send");
};

/**
 * Hook for sending notification to a specific device
 * Uses POST /api/notification/send-to-exact endpoint
 */
export const useSendNotificationToDevice = () => {
  return $api.useMutation("post", "/api/notification/send-to-exact");
};

/**
 * Hook for sending notification to all users
 * Uses POST /api/notification/send-to-all endpoint
 */
export const useSendNotificationToAll = () => {
  return $api.useMutation("post", "/api/notification/send-to-all");
};

/**
 * Hook for registering device token
 * Uses POST /api/notification/device endpoint
 */
export const useRegisterDeviceToken = () => {
  return $api.useMutation("post", "/api/notification/device");
};

// ==================== ENHANCED MUTATIONS WITH AUTO TOAST ====================

/**
 * Hook for deleting notification with automatic toast notifications
 */
export const useDeleteNotificationWithToast = () => {
  const deleteMutation = useDeleteNotification();
  
  return useMutationHandler({
    mutationFn: (variables: any) => deleteMutation.mutateAsync(variables),
    successMessage: "Xóa thông báo thành công",
    errorMessage: "Không thể xóa thông báo",
  });
};

/**
 * Hook for marking notification as read with automatic toast notifications
 */
export const useMarkAsReadWithToast = () => {
  const markAsReadMutation = useMarkAsRead();
  
  return useMutationHandler({
    mutationFn: (variables: any) => markAsReadMutation.mutateAsync(variables),
    showSuccessToast: false, // Don't show toast for mark as read
    errorMessage: "Không thể đánh dấu đã đọc",
  });
};

/**
 * Hook for creating notification with automatic toast notifications
 */
export const useCreateNotificationWithToast = () => {
  const createMutation = useCreateNotification();
  
  return useMutationHandler({
    mutationFn: (variables: any) => createMutation.mutateAsync(variables),
    successMessage: "Tạo thông báo thành công",
    errorMessage: "Không thể tạo thông báo",
  });
};

/**
 * Hook for updating notification with automatic toast notifications
 */
export const useUpdateNotificationWithToast = () => {
  const updateMutation = useUpdateNotification();
  
  return useMutationHandler({
    mutationFn: (variables: any) => updateMutation.mutateAsync(variables),
    successMessage: "Cập nhật thông báo thành công",
    errorMessage: "Không thể cập nhật thông báo",
  });
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
