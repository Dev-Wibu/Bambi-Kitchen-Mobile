import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetNotificationsByAccountId,
  useMarkAsRead,
} from "@/services/notificationService";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

interface NotificationDropdownProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ visible, onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const { user } = useAuth();

  const { data: notifications, isLoading, refetch } = useGetNotificationsByAccountId(
    user?.userId || 0
  );
  const markAsReadMutation = useMarkAsRead();

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync({
        params: { path: { id } },
      });
      refetch();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleNotificationPress = (notification: any) => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    onClose();
    
    // Navigate based on notification type/data
    if (notification.data) {
      try {
        const data = typeof notification.data === 'string' 
          ? JSON.parse(notification.data) 
          : notification.data;
        
        // Handle different notification types
        if (data.type === 'order' && data.orderId) {
          router.push(`/(tabs)/order`);
        } else if (data.type === 'dish' && data.dishId) {
          router.push(`/(tabs)/menu`);
        } else if (data.type === 'profile') {
          router.push(`/(tabs)/profile`);
        } else {
          // Default: go to notifications page to see details
          router.push("/(tabs)/notifications");
        }
      } catch (error) {
        // If data parsing fails, just go to notifications page
        router.push("/(tabs)/notifications");
      }
    } else {
      // No specific data, go to notifications page
      router.push("/(tabs)/notifications");
    }
  };

  const handleSeeMore = () => {
    onClose();
    router.push("/(tabs)/notifications");
  };

  // Get recent notifications (max 5)
  const recentNotifications = notifications?.slice(0, 5) || [];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <Pressable
          className="absolute right-4 top-20 w-80 rounded-lg bg-white shadow-lg dark:bg-gray-800"
          onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View className="border-b border-gray-200 p-4 dark:border-gray-700">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Thông báo</Text>
              <Pressable onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#666" />
              </Pressable>
            </View>
          </View>

          {/* Notification List */}
          <ScrollView className="max-h-96">
            {isLoading ? (
              <View className="p-8">
                <ActivityIndicator size="large" color="#FF6D00" />
              </View>
            ) : recentNotifications.length === 0 ? (
              <View className="p-8">
                <MaterialIcons
                  name="notifications-none"
                  size={48}
                  color="#D1D5DB"
                  style={{ alignSelf: "center", marginBottom: 8 }}
                />
                <Text className="text-center text-gray-500 dark:text-gray-400">
                  Chưa có thông báo nào
                </Text>
              </View>
            ) : (
              recentNotifications.map((notification) => (
                <Pressable
                  key={notification.id}
                  onPress={() => handleNotificationPress(notification)}
                  className={`border-b border-gray-100 p-4 active:bg-gray-50 dark:border-gray-700 dark:active:bg-gray-700 ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}>
                  <View className="flex-row items-start gap-3">
                    <View
                      className={`mt-1 h-2 w-2 rounded-full ${notification.read ? "bg-gray-300" : "bg-blue-500"}`}
                    />
                    <View className="flex-1">
                      <Text className="mb-1 font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </Text>
                      <Text
                        className="mb-2 text-sm text-gray-600 dark:text-gray-300"
                        numberOfLines={2}>
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
                </Pressable>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <View className="border-t border-gray-200 p-3 dark:border-gray-700">
              <Button
                variant="ghost"
                onPress={handleSeeMore}
                className="w-full">
                <Text className="font-semibold text-[#FF6D00]">Xem tất cả</Text>
              </Button>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
