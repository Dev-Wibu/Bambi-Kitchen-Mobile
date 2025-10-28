/**
 * Example component demonstrating push notification usage
 * This file shows practical examples of how to integrate push notifications
 * You can copy these examples into your actual components
 */

import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  clearBadge,
  getBadgeCount,
  hasNotificationPermission,
  requestNotificationPermission,
  scheduleLocalNotification,
  setBadgeCount,
} from "@/services/pushNotificationService";
import { useEffect, useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, View } from "react-native";

export default function PushNotificationExampleScreen() {
  const { expoPushToken, isRegistered, isLoading, error, notification, registerToken } =
    usePushNotifications();

  const [badgeCount, setBadgeCountState] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
    updateBadgeCount();
  }, []);

  // Update badge count when notification received
  useEffect(() => {
    if (notification) {
      updateBadgeCount();
    }
  }, [notification]);

  const checkPermission = async () => {
    const granted = await hasNotificationPermission();
    setHasPermission(granted);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);

    if (granted) {
      Alert.alert("Success", "Notification permission granted!");
    } else {
      Alert.alert("Denied", "Notification permission was denied");
    }
  };

  const updateBadgeCount = async () => {
    const count = await getBadgeCount();
    setBadgeCountState(count);
  };

  const handleTestLocalNotification = async () => {
    try {
      await scheduleLocalNotification(
        {
          title: "🎉 Test Notification",
          body: "This is a test notification from the app!",
          data: { testData: "Hello from notification" },
        },
        5 // Show after 5 seconds
      );

      Alert.alert("Scheduled", "Test notification will appear in 5 seconds");
    } catch (error) {
      Alert.alert("Error", "Failed to schedule notification");
    }
  };

  const handleIncreaseBadge = async () => {
    const newCount = badgeCount + 1;
    await setBadgeCount(newCount);
    await updateBadgeCount();
  };

  const handleClearBadge = async () => {
    await clearBadge();
    await updateBadgeCount();
  };

  const handleCopyToken = () => {
    if (expoPushToken) {
      // Note: Clipboard requires @react-native-clipboard/clipboard
      // For now, we'll just show the token
      Alert.alert("Push Token", expoPushToken, [{ text: "OK" }]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Push Notification Status</Text>

        <View style={styles.statusCard}>
          <StatusItem label="Permission" value={hasPermission ? "✅ Granted" : "❌ Not granted"} />
          <StatusItem label="Registered" value={isRegistered ? "✅ Yes" : "❌ No"} />
          <StatusItem label="Loading" value={isLoading ? "⏳ Yes" : "✅ No"} />
          {error && <StatusItem label="Error" value={error} isError />}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 Push Token</Text>

        <View style={styles.tokenCard}>
          <Text style={styles.tokenLabel}>Expo Push Token:</Text>
          <Text style={styles.tokenValue} selectable>
            {expoPushToken || "Not registered yet"}
          </Text>

          {expoPushToken && <Button title="Show Token" onPress={handleCopyToken} />}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Actions</Text>

        <View style={styles.buttonGroup}>
          {!hasPermission && (
            <Button title="Request Permission" onPress={handleRequestPermission} />
          )}

          <View style={styles.buttonSpacer} />

          {!isRegistered && hasPermission && (
            <Button title="Register Push Token" onPress={registerToken} disabled={isLoading} />
          )}

          <View style={styles.buttonSpacer} />

          <Button title="Test Local Notification (5s)" onPress={handleTestLocalNotification} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Badge Management (iOS)</Text>

        <View style={styles.badgeCard}>
          <Text style={styles.badgeText}>Current Badge Count: {badgeCount}</Text>

          <View style={styles.buttonGroup}>
            <Button title="Increase Badge (+1)" onPress={handleIncreaseBadge} />

            <View style={styles.buttonSpacer} />

            <Button title="Clear Badge" onPress={handleClearBadge} />
          </View>
        </View>
      </View>

      {notification && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📬 Latest Notification</Text>

          <View style={styles.notificationCard}>
            <Text style={styles.notificationTitle}>{notification.request.content.title}</Text>
            <Text style={styles.notificationBody}>{notification.request.content.body}</Text>
            {notification.request.content.data && (
              <Text style={styles.notificationData}>
                Data: {JSON.stringify(notification.request.content.data, null, 2)}
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Documentation</Text>
        <Text style={styles.docText}>
          For detailed implementation guide, see:{"\n\n"}
          📄 PUSH_NOTIFICATION_GUIDE_VI.md{"\n"}
          📄 BACKEND_PUSH_NOTIFICATION_ANALYSIS.md{"\n\n"}
          These files contain complete Vietnamese documentation on:{"\n"}• How to use push
          notifications{"\n"}• Backend integration details{"\n"}• Troubleshooting tips{"\n"}• Best
          practices{"\n"}
        </Text>
      </View>
    </ScrollView>
  );
}

// Helper component for status display
function StatusItem({
  label,
  value,
  isError = false,
}: {
  label: string;
  value: string;
  isError?: boolean;
}) {
  return (
    <View style={styles.statusItem}>
      <Text style={styles.statusLabel}>{label}:</Text>
      <Text style={[styles.statusValue, isError && styles.errorText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  statusValue: {
    fontSize: 14,
    color: "#333",
  },
  errorText: {
    color: "#e74c3c",
  },
  tokenCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tokenLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  tokenValue: {
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    color: "#333",
  },
  buttonGroup: {
    gap: 12,
  },
  buttonSpacer: {
    height: 8,
  },
  badgeCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  notificationCard: {
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  notificationData: {
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
    color: "#333",
  },
  docText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
  },
});
