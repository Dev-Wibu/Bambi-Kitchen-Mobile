import { fetchClient } from "@/libs/api";
import type { components } from "@/schema-from-be";

// ==================== TYPES ====================

export type NotificationSendingRequest = components["schemas"]["NotificationSendingRequest"];

export interface SendNotificationParams {
  title: string;
  message: string;
  userId?: number;
  deviceToken?: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Send a push notification to a specific user (all their devices)
 * @param params - Notification parameters
 * @returns Promise with the result message
 */
export async function sendNotificationToUser(
  params: SendNotificationParams & { userId: number }
): Promise<string> {
  const response = await fetchClient.POST("/api/notification/send", {
    body: {
      title: params.title,
      message: params.message,
      userId: params.userId,
    },
  });

  if (!response.data) {
    throw new Error(`Failed to send notification: ${JSON.stringify(response)}`);
  }

  return response.data || "Notification sent successfully";
}

/**
 * Send a push notification to a specific device
 * @param params - Notification parameters including deviceToken
 * @returns Promise with the result message
 */
export async function sendNotificationToDevice(
  params: SendNotificationParams & { userId: number; deviceToken: string }
): Promise<string> {
  const response = await fetchClient.POST("/api/notification/send-to-exact", {
    body: {
      title: params.title,
      message: params.message,
      userId: params.userId,
      deviceToken: params.deviceToken,
    },
  });

  if (!response.data) {
    throw new Error(`Failed to send notification to device: ${JSON.stringify(response)}`);
  }

  return response.data || "Notification sent to device successfully";
}

/**
 * Send a push notification to all users
 * @param params - Notification parameters
 * @returns Promise with the result message
 */
export async function sendNotificationToAll(params: SendNotificationParams): Promise<string> {
  const response = await fetchClient.POST("/api/notification/send-to-all", {
    body: {
      title: params.title,
      message: params.message,
    },
  });

  if (!response.data) {
    throw new Error(`Failed to send notification to all users: ${JSON.stringify(response)}`);
  }

  return response.data || "Notification sent to all users successfully";
}

/**
 * Register a device token for push notifications
 * @param token - Expo push token
 * @param userId - User ID
 * @param platform - Platform type (ANDROID, IOS, WEB)
 * @returns Promise with the result message
 */
export async function registerDeviceToken(
  token: string,
  userId: number,
  platform: "ANDROID" | "IOS" | "WEB"
): Promise<string> {
  const response = await fetchClient.POST("/api/notification/device", {
    body: {
      token,
      userId,
      platform,
    } as any, // Type assertion because schema is outdated
  });

  if (!response.data) {
    throw new Error(`Failed to register device token: ${JSON.stringify(response)}`);
  }

  return response.data || "Device token registered successfully";
}

/**
 * Mark a notification as read
 * @param notificationId - ID of the notification to mark as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const response = await fetchClient.PATCH("/api/notification/{id}/check-read", {
    params: {
      path: { id: notificationId },
    },
  });

  // Backend returns 200 OK with no response body for this endpoint
  // Check for error response instead of checking for data
  if (response.error) {
    throw new Error(`Failed to mark notification as read: ${JSON.stringify(response)}`);
  }
}

/**
 * Create a notification in the database
 * @param notification - Notification data
 * @returns The created notification
 */
export async function createNotification(notification: {
  title: string;
  message: string;
  accountId: number;
}): Promise<components["schemas"]["Notification"]> {
  const response = await fetchClient.POST("/api/notification", {
    body: {
      title: notification.title,
      message: notification.message,
      account: {
        id: notification.accountId,
      },
      read: false,
    } as any,
  });

  if (!response.data) {
    throw new Error(`Failed to create notification: ${JSON.stringify(response)}`);
  }

  return response.data;
}

/**
 * Get all notifications for a user
 * @param accountId - User account ID
 * @returns Array of notifications
 */
export async function getNotificationsByAccountId(
  accountId: number
): Promise<components["schemas"]["Notification"][]> {
  const response = await fetchClient.GET("/api/notification/to-account/{id}", {
    params: {
      path: { id: accountId },
    },
  });

  // Check for errors (including 401 unauthorized)
  if (response.error) {
    throw new Error(`Failed to get notifications: ${JSON.stringify(response)}`);
  }

  return response.data || [];
}

// ==================== NOTIFICATION TEMPLATES ====================

/**
 * Send an order notification to a user
 */
export async function sendOrderNotification(userId: number, orderId: number): Promise<string> {
  return sendNotificationToUser({
    userId,
    title: "Đơn hàng mới",
    message: `Đơn hàng #${orderId} đã được tạo thành công`,
  });
}

/**
 * Send a dish availability notification to all users
 */
export async function sendDishAvailabilityNotification(dishName: string): Promise<string> {
  return sendNotificationToAll({
    title: "Món ăn mới",
    message: `${dishName} hiện đã có sẵn!`,
  });
}

/**
 * Send a low stock notification to managers
 */
export async function sendLowStockNotification(
  userId: number,
  ingredientName: string
): Promise<string> {
  return sendNotificationToUser({
    userId,
    title: "Cảnh báo tồn kho",
    message: `${ingredientName} sắp hết hàng`,
  });
}

/**
 * Send order status update notification
 */
export async function sendOrderStatusNotification(
  userId: number,
  orderId: number,
  status: string
): Promise<string> {
  const statusMessages: Record<string, string> = {
    PENDING: "đang chờ xử lý",
    PREPARING: "đang được chuẩn bị",
    READY: "đã sẵn sàng",
    COMPLETED: "đã hoàn thành",
    CANCELLED: "đã bị hủy",
  };

  return sendNotificationToUser({
    userId,
    title: "Cập nhật đơn hàng",
    message: `Đơn hàng #${orderId} ${statusMessages[status] || status}`,
  });
}
