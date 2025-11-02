import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { useGetNotificationsByAccountId, useMarkAsRead } from "@/services/notificationService";
import { MaterialIcons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, View } from "react-native";

interface NotificationDropdownProps {
  children: React.ReactNode;
}

export function NotificationDropdown({ children }: NotificationDropdownProps) {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: notifications,
    isLoading,
    refetch,
  } = useGetNotificationsByAccountId(user?.userId || 0);
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

    // Navigate based on notification type/data
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
    router.push("/(tabs)/notifications");
  };

  // Get recent notifications (max 5)
  const recentNotifications = notifications?.slice(0, 5) || [];

  return (
    <DropdownMenu>
      {children}
      <DropdownMenuContent className="w-80" align="end" sideOffset={8}>
        <DropdownMenuLabel>
          <Text className="text-lg font-bold">Thông báo</Text>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

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
              <Text className="text-center text-muted-foreground">Chưa có thông báo nào</Text>
            </View>
          ) : (
            recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                className={!notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                <View className="flex-row items-start gap-3 py-2">
                  <View
                    className={`mt-1 h-2 w-2 rounded-full ${notification.read ? "bg-gray-300" : "bg-blue-500"}`}
                  />
                  <View className="flex-1">
                    <Text className="mb-1 font-semibold">{notification.title}</Text>
                    <Text className="mb-2 text-sm text-muted-foreground" numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {notification.createdAt
                        ? formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })
                        : "Mới"}
                    </Text>
                  </View>
                </View>
              </DropdownMenuItem>
            ))
          )}
        </ScrollView>

        {/* Footer */}
        {recentNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onPress={handleSeeMore}>
              <Text className="w-full text-center font-semibold text-[#FF6D00]">Xem tất cả</Text>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
