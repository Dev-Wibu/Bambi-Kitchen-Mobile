import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { Notification } from "@/interfaces/notification.interface";
import {
  useDeleteNotification,
  useMarkAsRead,
  useNotifications,
  useSendNotificationToAll,
  useSendNotificationToUser,
} from "@/services/notificationService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function NotificationManagement() {
  const [deleteConfirm, setDeleteConfirm] = useState<Notification | null>(null);

  const queryClient = useQueryClient();

  // Query hooks
  const { data: notifications, isLoading } = useNotifications();
  const deleteMutation = useDeleteNotification();
  const markAsReadMutation = useMarkAsRead();

  const handleDelete = (notification: Notification) => {
    setDeleteConfirm(notification);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm?.id) return;

    try {
      await deleteMutation.mutateAsync({
        params: { path: { id: deleteConfirm.id } },
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Notification deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setDeleteConfirm(null);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete notification",
      });
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.id) return;

    try {
      await markAsReadMutation.mutateAsync({
        params: { path: { id: notification.id } },
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Notification marked as read",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to mark notification as read",
      });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
        <Text className="mt-4 text-base text-gray-600 dark:text-gray-300">
          Loading notifications...
        </Text>
      </SafeAreaView>
    );
  }

  if (deleteConfirm) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <MaterialIcons
              name="warning"
              size={48}
              color="#FF6D00"
              style={{ alignSelf: "center" }}
            />
            <Text className="mt-4 text-center text-xl font-bold text-[#000000] dark:text-white">
              Confirm Delete
            </Text>
            <Text className="mt-2 text-center text-base text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this notification?
            </Text>
            <View className="mt-6 flex-row gap-3">
              <Button
                className="flex-1 bg-gray-300 active:bg-gray-400"
                onPress={() => setDeleteConfirm(null)}>
                <Text className="font-semibold text-[#000000]">Cancel</Text>
              </Button>
              <Button
                className="flex-1 bg-red-500 active:bg-red-600"
                onPress={confirmDelete}
                disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-semibold text-white">Delete</Text>
                )}
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                Notification Management
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                View and manage system notifications
              </Text>
            </View>
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView className="flex-1" contentContainerClassName="p-6">
          {!notifications || notifications.length === 0 ? (
            <View className="items-center py-12">
              <MaterialIcons name="notifications-none" size={64} color="#ccc" />
              <Text className="mt-4 text-center text-base text-gray-600 dark:text-gray-300">
                No notifications found
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {notifications.map((notification: Notification) => (
                <TouchableOpacity
                  key={notification.id}
                  className={`rounded-xl border p-4 ${
                    notification.read
                      ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                      : "border-[#FF6D00] bg-orange-50 dark:bg-orange-900"
                  }`}
                  activeOpacity={0.7}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-lg font-bold text-[#000000] dark:text-white">
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View className="h-2 w-2 rounded-full bg-[#FF6D00]" />
                        )}
                      </View>
                      <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {notification.message}
                      </Text>
                      {notification.account && (
                        <Text className="mt-2 text-xs text-gray-500">
                          To: {notification.account.name} ({notification.account.mail})
                        </Text>
                      )}
                      <Text className="mt-1 text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      {!notification.read && (
                        <TouchableOpacity
                          className="rounded-lg bg-green-500 p-2 active:bg-green-600"
                          onPress={() => handleMarkAsRead(notification)}>
                          <MaterialIcons name="check" size={20} color="white" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        className="rounded-lg bg-red-500 p-2 active:bg-red-600"
                        onPress={() => handleDelete(notification)}>
                        <MaterialIcons name="delete" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
