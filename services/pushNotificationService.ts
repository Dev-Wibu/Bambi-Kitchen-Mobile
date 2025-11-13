import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ==================== NOTIFICATION CONFIGURATION ====================

/**
 * Configure how notifications are handled when the app is in the foreground
 * This determines whether to show alerts, play sounds, or set badges
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Show notification banner
    shouldShowList: true, // Show notification in notification list
    shouldPlaySound: true, // Play notification sound
    shouldSetBadge: true, // Update app badge
  }),
});

// ==================== TYPES ====================

export type PushNotificationToken = string;

export interface DeviceTokenRegistration {
  token: string;
  userId: number;
  platform: "ANDROID" | "IOS" | "WEB";
}

export interface NotificationData {
  title?: string;
  body?: string;
  data?: Record<string, any>;
}

// ==================== PUSH TOKEN MANAGEMENT ====================

/**
 * Register for push notifications and get the Expo push token
 * This function handles permission requests and token generation
 *
 * @returns {Promise<string | null>} The Expo push token or null if registration fails
 *
 * @example
 * const token = await registerForPushNotificationsAsync();
 * if (token) {
 *   console.log('Push token:', token);
 * }
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Check if we're running on a physical device
    if (!Device.isDevice) {
      // Silently return null - caller will handle this gracefully
      return null;
    }

    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permission not granted, request it
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If permission denied, return null
    if (finalStatus !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    // Get the Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.warn("Project ID not found in app configuration");
      // For development, we can still get a token without projectId
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log("Expo Push Token:", tokenData.data);

    // Configure notification channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF6D00",
        sound: "default",
      });
    }

    return tokenData.data;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
    return null;
  }
}

/**
 * Get the platform type for the current device
 * @returns {DeviceTokenRegistration["platform"]} Platform identifier
 */
export function getPlatform(): DeviceTokenRegistration["platform"] {
  if (Platform.OS === "android") {
    return "ANDROID";
  } else if (Platform.OS === "ios") {
    return "IOS";
  } else {
    return "WEB";
  }
}

// ==================== NOTIFICATION LISTENERS ====================

/**
 * Add a listener for notifications received while the app is in the foreground
 *
 * @param {function} handler - Function to handle received notifications
 * @returns {Notifications.Subscription} Subscription object to remove the listener
 *
 * @example
 * const subscription = addNotificationReceivedListener((notification) => {
 *   console.log('Notification received:', notification);
 * });
 *
 * // Later, remove the listener
 * subscription.remove();
 */
export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Add a listener for notification interactions (user taps on notification)
 *
 * @param {function} handler - Function to handle notification responses
 * @returns {Notifications.Subscription} Subscription object to remove the listener
 *
 * @example
 * const subscription = addNotificationResponseReceivedListener((response) => {
 *   console.log('User tapped notification:', response);
 *   // Navigate to a specific screen based on notification data
 * });
 */
export function addNotificationResponseReceivedListener(
  handler: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

// ==================== LOCAL NOTIFICATIONS ====================

/**
 * Schedule a local notification (for testing purposes)
 *
 * @param {NotificationData} notification - Notification content
 * @param {number} seconds - Delay in seconds before showing the notification
 * @returns {Promise<string>} Notification identifier
 *
 * @example
 * await scheduleLocalNotification({
 *   title: 'Test Notification',
 *   body: 'This is a test notification',
 * }, 5); // Will show after 5 seconds
 */
export async function scheduleLocalNotification(
  notification: NotificationData,
  seconds: number = 5
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title || "Notification",
      body: notification.body || "",
      data: notification.data || {},
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}

/**
 * Cancel all scheduled local notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// ==================== PERMISSION UTILITIES ====================

/**
 * Check if notification permissions are granted
 * @returns {Promise<boolean>} True if permissions are granted
 */
export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Request notification permissions
 * @returns {Promise<boolean>} True if permissions are granted after request
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ==================== BADGE MANAGEMENT ====================

/**
 * Set the app icon badge number (iOS only)
 * @param {number} count - Badge count (0 to clear)
 */
export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === "ios") {
    await Notifications.setBadgeCountAsync(count);
  }
}

/**
 * Get the current badge count
 * @returns {Promise<number>} Current badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Clear the app icon badge
 */
export async function clearBadge(): Promise<void> {
  await setBadgeCount(0);
}
