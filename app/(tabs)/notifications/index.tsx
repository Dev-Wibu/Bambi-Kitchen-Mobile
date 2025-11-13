import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetNotificationsByAccountId,
  useMarkAsReadWithToast,
} from "@/services/notificationService";
import { MaterialIcons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: notifications,
    isLoading,
    refetch,
  } = useGetNotificationsByAccountId(user?.userId || 0);
  const markAsReadMutation = useMarkAsReadWithToast();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync({
        params: { path: { id } },
      });
      refetch();
      Toast.show({
        type: "success",
        text1: "Đã đánh dấu đã đọc",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể đánh dấu đã đọc",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications?.filter((n) => !n.read) || [];

    if (unreadNotifications.length === 0) {
      Toast.show({
        type: "info",
        text1: "Tất cả thông báo đã được đọc",
      });
      return;
    }

    try {
      // Mark all unread as read
      await Promise.all(
        unreadNotifications.map((n) =>
          markAsReadMutation.mutateAsync({
            params: { path: { id: n.id! } },
          })
        )
      );
      refetch();
      Toast.show({
        type: "success",
        text1: "Đã đánh dấu tất cả đã đọc",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể đánh dấu tất cả đã đọc",
      });
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification data
    if (notification.data) {
      try {
        const data =
          typeof notification.data === "string" ? JSON.parse(notification.data) : notification.data;

        // Handle different notification types
        if (data.type === "order" && data.orderId) {
          router.push(`/(tabs)/order`);
        } else if (data.type === "dish" && data.dishId) {
          router.push(`/(tabs)/menu`);
        } else if (data.type === "profile") {
          router.push(`/(tabs)/profile`);
        }
      } catch (error) {
        // If data parsing fails, just stay on notifications page
        console.log("Failed to parse notification data:", error);
      }
    }
  };

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#000" />
            </Pressable>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Thông báo</Text>
          </View>
          {unreadCount > 0 && (
            <Pressable onPress={handleMarkAllAsRead}>
              <Text className="font-semibold text-[#FF6D00]">Đọc tất cả</Text>
            </Pressable>
          )}
        </View>
        {unreadCount > 0 && (
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {unreadCount} thông báo chưa đọc
          </Text>
        )}
      </View>

      {/* Notification List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FF6D00" />
        }>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#FF6D00" />
          </View>
        ) : !notifications || notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons
              name="notifications-none"
              size={64}
              color="#D1D5DB"
              style={{ marginBottom: 16 }}
            />
            <Text className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Chưa có thông báo nào
            </Text>
            <Text className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              Các thông báo mới sẽ xuất hiện ở đây
            </Text>
          </View>
        ) : (
          <View className="pb-4">
            {notifications.map((notification) => (
              <Pressable
                key={notification.id}
                onPress={() => handleNotificationClick(notification)}
                className={`border-b border-gray-100 dark:border-gray-800 ${
                  !notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
                }`}>
                <View className="px-6 py-4">
                  <View className="mb-2 flex-row items-start justify-between gap-3">
                    <View className="flex-1 flex-row items-start gap-3">
                      <View
                        className={`mt-1.5 h-2.5 w-2.5 rounded-full ${notification.read ? "bg-gray-300" : "bg-blue-500"}`}
                      />
                      <View className="flex-1">
                        <Text className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </Text>
                        <Text className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                          {notification.message}
                        </Text>
                        <Text className="text-xs text-gray-400 dark:text-gray-500">
                          {notification.createdAt
                            ? formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: vi,
                              })
                            : "Mới"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions */}
                  {!notification.read && (
                    <View className="mt-2 flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => handleMarkAsRead(notification.id!)}
                        className="flex-1 border-gray-300">
                        <Text className="text-xs text-gray-700">Đánh dấu đã đọc</Text>
                      </Button>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
