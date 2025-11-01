import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { useGetNotificationsByAccountId } from "@/services/notificationService";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

interface NotificationBellProps {
  onPress?: () => void;
}

export function NotificationBell({ onPress }: NotificationBellProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Fetch notifications for current user
  const { data: notifications } = useGetNotificationsByAccountId(user?.userId || 0);

  // Count unread notifications
  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to notifications page
      router.push("/(tabs)/notifications");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="relative rounded-full bg-white p-3 shadow-sm dark:bg-gray-800">
      <MaterialIcons name="notifications" size={24} color="#FF6D00" />
      {unreadCount > 0 && (
        <View className="absolute right-1 top-1 min-w-[18px] rounded-full bg-red-500 px-1">
          <Text className="text-center text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
