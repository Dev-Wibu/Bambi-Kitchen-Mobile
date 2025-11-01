import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ManagerTab() {
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
          <Text className="mb-2 text-3xl font-bold text-[#000000] dark:text-white">
            Manager Dashboard
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-300">
            Welcome, {user?.name || "Manager"}!
          </Text>
        </View>

        {/* Role Badge */}
        <View className="mb-6 rounded-2xl bg-gradient-to-r from-orange-100 to-orange-50 p-6 dark:bg-gray-800">
          <View className="mb-4 flex-row items-center">
            <MaterialIcons name="admin-panel-settings" size={24} color="#FF6D00" />
            <Text className="ml-2 text-lg font-semibold text-[#000000] dark:text-white">
              Administrator Access
            </Text>
          </View>
          <View className="gap-3">
            <View>
              <Text className="text-sm text-[#757575]">Name</Text>
              <Text className="text-base font-medium text-[#000000] dark:text-white">
                {user?.name || "N/A"}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-[#757575]">User ID</Text>
              <Text className="text-base font-medium text-[#000000] dark:text-white">
                {user?.userId || "N/A"}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-[#757575]">Role</Text>
              <Text className="text-base font-medium text-[#FF6D00]">{user?.role || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Management Sections */}
        <View className="mb-6">
          <Text className="mb-4 text-xl font-bold text-[#000000] dark:text-white">
            Management Tools
          </Text>
          <View className="gap-4">
            {/* Account Management */}
            <TouchableOpacity
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              onPress={() => router.push("/manager/accounts")}
              activeOpacity={0.7}>
              <View className="mb-2 flex-row items-center">
                <MaterialIcons name="people" size={20} color="#FF6D00" />
                <Text className="ml-2 text-base font-semibold text-[#000000] dark:text-white">
                  Account Management
                </Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                Manage user accounts and permissions
              </Text>
            </TouchableOpacity>

            {/* Dish Management */}
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="mb-2 flex-row items-center">
                <MaterialIcons name="restaurant-menu" size={20} color="#FF6D00" />
                <Text className="ml-2 text-base font-semibold text-[#000000] dark:text-white">
                  Dish Management
                </Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                Create and manage dishes and menu items
              </Text>
            </View>

            {/* Ingredient Management */}
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="mb-2 flex-row items-center">
                <MaterialIcons name="inventory" size={20} color="#FF6D00" />
                <Text className="ml-2 text-base font-semibold text-[#000000] dark:text-white">
                  Ingredient Inventory
                </Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                Manage ingredients and inventory levels
              </Text>
            </View>

            {/* Order Management */}
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="mb-2 flex-row items-center">
                <MaterialIcons name="receipt-long" size={20} color="#FF6D00" />
                <Text className="ml-2 text-base font-semibold text-[#000000] dark:text-white">
                  Order Management
                </Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                View and manage customer orders
              </Text>
            </View>

            {/* Notifications */}
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="mb-2 flex-row items-center">
                <MaterialIcons name="notifications" size={20} color="#FF6D00" />
                <Text className="ml-2 text-base font-semibold text-[#000000] dark:text-white">
                  Notifications
                </Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                Send notifications to users
              </Text>
            </View>
          </View>
        </View>

        {/* Statistics Card (if ADMIN) */}
        {user?.role === "ADMIN" && (
          <View className="mb-6 rounded-2xl bg-blue-50 p-6 dark:bg-gray-800">
            <Text className="mb-4 text-lg font-semibold text-[#000000] dark:text-white">
              Quick Stats
            </Text>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-300">Total Users</Text>
                <Text className="text-base font-bold text-[#FF6D00]">-</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-300">Total Orders</Text>
                <Text className="text-base font-bold text-[#FF6D00]">-</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-300">Active Dishes</Text>
                <Text className="text-base font-bold text-[#FF6D00]">-</Text>
              </View>
            </View>
          </View>
        )}

        {/* Logout Button */}
        <View className="mt-auto h-6">
          <Button
            className="w-full rounded-3xl bg-red-500 py-1 active:bg-red-600"
            onPress={handleLogout}>
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
