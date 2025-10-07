import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      Toast.show({
        type: "success",
        text1: "Logged out",
        text2: "You have been successfully logged out",
      });
      router.replace("/(auth)/login");
    } catch {
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: "An error occurred while logging out",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="mb-2 text-3xl font-bold text-[#000000] dark:text-white">Profile</Text>
          <Text className="text-base text-gray-600 dark:text-gray-300">
            Manage your account settings
          </Text>
        </View>

        {/* User Info Card */}
        <View className="mb-6 rounded-2xl bg-gray-50 p-6 dark:bg-gray-800">
          <View className="mb-4 flex-row items-center">
            <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-[#FF6D00]">
              <MaterialIcons name="person" size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-xl font-bold text-[#000000] dark:text-white">
                {user?.name || "User"}
              </Text>
              <Text className="text-sm text-[#757575]">ID: {user?.userId || "N/A"}</Text>
            </View>
          </View>

          <View className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600 dark:text-gray-300">Role</Text>
              <View className="rounded-full bg-[#FF6D00] px-3 py-1">
                <Text className="text-xs font-bold text-white">{user?.role || "N/A"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        <View className="mb-6">
          <Text className="mb-4 text-xl font-bold text-[#000000] dark:text-white">Settings</Text>
          <View className="gap-4">
            {/* Account Settings */}
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                  <MaterialIcons name="settings" size={20} color="#FF6D00" />
                  <Text className="ml-3 text-base font-medium text-[#000000] dark:text-white">
                    Account Settings
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </View>

            {/* Privacy */}
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                  <MaterialIcons name="privacy-tip" size={20} color="#FF6D00" />
                  <Text className="ml-3 text-base font-medium text-[#000000] dark:text-white">
                    Privacy
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </View>

            {/* Notifications */}
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                  <MaterialIcons name="notifications" size={20} color="#FF6D00" />
                  <Text className="ml-3 text-base font-medium text-[#000000] dark:text-white">
                    Notifications
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </View>

            {/* Help & Support */}
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                  <MaterialIcons name="help" size={20} color="#FF6D00" />
                  <Text className="ml-3 text-base font-medium text-[#000000] dark:text-white">
                    Help & Support
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </View>

            {/* About */}
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                  <MaterialIcons name="info" size={20} color="#FF6D00" />
                  <Text className="ml-3 text-base font-medium text-[#000000] dark:text-white">
                    About
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mt-auto pt-6">
          <Button className="w-full bg-red-500 active:bg-red-600" onPress={handleLogout}>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="logout" size={20} color="white" />
              <Text className="text-lg font-bold text-white">Logout</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
