import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";
import { useNotifications } from "@/contexts/NotificationContext";
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
  const { notifications, isLoading, handleNotificationPress } = useNotifications();

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
            recentNotifications
              .slice()
              .reverse()
              .map((notification) => (
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
