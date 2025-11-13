import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";
import { useNotifications } from "@/contexts/NotificationContext";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <DropdownMenuTrigger asChild>
      <Pressable className="relative rounded-full bg-white p-3 shadow-sm dark:bg-gray-800">
        <MaterialIcons name="notifications" size={24} color="#FF6D00" />
        {unreadCount > 0 && (
          <View className="absolute right-1 top-1 min-w-[18px] rounded-full bg-red-500 px-1">
            <Text className="text-center text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>
    </DropdownMenuTrigger>
  );
}
