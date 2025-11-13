import { usePushNotifications } from "@/hooks/usePushNotifications";
import type { components } from "@/schema-from-be";
import {
  getNotificationsByAccountId,
  markNotificationAsRead,
} from "@/services/notificationHelpers";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// ==================== TYPES ====================

type Notification = components["schemas"]["Notification"];

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  expoPushToken: string | null;
  isTokenRegistered: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  handleNotificationPress: (notification: Notification) => void;
}

// ==================== CONTEXT ====================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  // Initialize push notifications
  const {
    expoPushToken,
    isRegistered: isTokenRegistered,
    notification: latestNotification,
  } = usePushNotifications();

  // Load notifications for the current user
  const refreshNotifications = useCallback(async () => {
    if (!user?.userId) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getNotificationsByAccountId(user.userId);
      setNotifications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load notifications";
      setError(errorMessage);
      console.error("Error loading notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      await Promise.all(unreadNotifications.map((n) => n.id && markNotificationAsRead(n.id)));
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      throw err;
    }
  }, [notifications]);

  // Handle notification press with navigation
  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      // Mark as read if unread
      if (!notification.read && notification.id) {
        markAsRead(notification.id).catch(console.error);
      }

      // Navigate based on notification data
      if (notification.message) {
        try {
          // Try to parse notification data if it contains navigation info
          const messageData = JSON.parse(notification.message);

          if (messageData.type === "order" && messageData.orderId) {
            router.push("/(tabs)/order");
          } else if (messageData.type === "dish" && messageData.dishId) {
            router.push("/(tabs)/menu");
          } else if (messageData.type === "profile") {
            router.push("/(tabs)/profile");
          }
        } catch {
          // If message is not JSON, just stay on notifications page
          console.log("Notification message is not JSON navigation data");
        }
      }
    },
    [markAsRead, router]
  );

  // Auto-refresh notifications when user changes
  useEffect(() => {
    if (user?.userId) {
      refreshNotifications();
    }
  }, [user?.userId, refreshNotifications]);

  // Refresh notifications when a new push notification is received
  useEffect(() => {
    if (latestNotification) {
      console.log("New push notification received, refreshing list");
      refreshNotifications();
    }
  }, [latestNotification, refreshNotifications]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    expoPushToken,
    isTokenRegistered,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    handleNotificationPress,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// ==================== HOOK ====================

/**
 * Hook to access notification context
 * Must be used within NotificationProvider
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
