import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getPlatform,
  registerForPushNotificationsAsync,
} from "@/services/pushNotificationService";
import { useAuthStore } from "@/stores/authStore";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
// ==================== TYPES ====================

export interface PushNotificationHookResult {
  expoPushToken: string | null;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  notification: Notifications.Notification | null;
  registerToken: () => Promise<void>;
}

// ==================== HOOK ====================

/**
 * Custom hook for managing push notifications in the app
 * Handles token registration, backend integration, and notification listeners
 *
 * @returns {PushNotificationHookResult} Push notification state and functions
 *
 * @example
 * function MyComponent() {
 *   const { expoPushToken, isRegistered, registerToken } = usePushNotifications();
 *
 *   useEffect(() => {
 *     if (!isRegistered) {
 *       registerToken();
 *     }
 *   }, [isRegistered]);
 *
 *   return <Text>Push Token: {expoPushToken}</Text>;
 * }
 */
export function usePushNotifications(): PushNotificationHookResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  // Get current user from auth store
  const user = useAuthStore((state) => state.user);

  /**
   * Register push token and send to backend
   */
  const registerToken = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get Expo push token
      const token = await registerForPushNotificationsAsync();

      if (!token) {
        throw new Error("Failed to get push notification token");
      }

      setExpoPushToken(token);

      // Register token with backend if user is logged in
      if (user?.userId) {
        const deviceTokenData = {
          token,
          userId: user.userId,
          platform: getPlatform(),
        };

        // Use raw fetch instead of fetchClient because backend returns plain text
        // Backend endpoint /api/notification/device returns "OK" as plain text, not JSON
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notification/device`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
          body: JSON.stringify(deviceTokenData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to register device token: ${errorText}`);
        }

        // Backend returns plain text "OK", not JSON
        const result = await response.text();
        console.log("Backend response:", result);

        setIsRegistered(true);
        console.log("Device token registered successfully with backend");
      } else {
        console.warn("User not logged in, token not sent to backend");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to register for push notifications";
      setError(errorMessage);
      console.error("Push notification registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up notification listeners
  useEffect(() => {
    // Listener for notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
      setNotification(notification);
    });

    // Listener for when user interacts with a notification
    responseListener.current = addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);

      // Handle navigation based on notification data
      // const data = response.notification.request.content.data;

      // TODO: Add navigation logic here based on notification type
      // For example:
      // if (data.type === 'order') {
      //   router.push(`/orders/${data.orderId}`);
      // }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Auto-register when user logs in
  useEffect(() => {
    if (user?.userId && !isRegistered && !isLoading) {
      registerToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  return {
    expoPushToken,
    isRegistered,
    isLoading,
    error,
    notification,
    registerToken,
  };
}
