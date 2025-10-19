import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { USE_MOCK_DATA, mockAccounts } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Use mock account data if available - only use if user is null
  const mockUser = USE_MOCK_DATA && !user && mockAccounts.length > 0 ? mockAccounts[0] : null;
  const displayUser = user || mockUser;

  // Extract user properties safely - handle both Account and AuthLoginData types
  const userId =
    displayUser && "userId" in displayUser
      ? displayUser.userId
      : displayUser && "id" in displayUser
        ? displayUser.id
        : "N/A";
  const userName = displayUser?.name || "N/A";
  const userRole = displayUser?.role || "N/A";
  const userMail = displayUser && "mail" in displayUser ? displayUser.mail : "Not available";
  const userPhone = displayUser && "phone" in displayUser ? displayUser.phone : "Not available";
  const userActive = displayUser && "active" in displayUser ? displayUser.active : true;

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

  const handleEditProfile = () => {
    Toast.show({
      type: "info",
      text1: "Edit Profile",
      text2: "Profile editing coming soon",
    });
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

        {/* User Profile Card */}
        <View className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF8A00] to-[#FF6D00] p-6 shadow-lg">
          {/* Profile Avatar */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                <MaterialIcons name="person" size={40} color="#FF6D00" />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-2xl font-bold text-white">{userName}</Text>
                <View className="flex-row items-center gap-2">
                  <View className="rounded-full bg-white/20 px-3 py-1">
                    <Text className="text-xs font-bold text-white">{userRole}</Text>
                  </View>
                </View>
              </View>
            </View>
            <Pressable
              onPress={handleEditProfile}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <MaterialIcons name="edit" size={20} color="white" />
            </Pressable>
          </View>

          {/* User Stats */}
          <View className="mt-4 flex-row justify-between border-t border-white/20 pt-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">0</Text>
              <Text className="text-xs text-white/80">Orders</Text>
            </View>
            <View className="h-12 w-px bg-white/20" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">0</Text>
              <Text className="text-xs text-white/80">Points</Text>
            </View>
            <View className="h-12 w-px bg-white/20" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">0</Text>
              <Text className="text-xs text-white/80">Reviews</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View className="mb-6 rounded-2xl bg-gray-50 p-6 dark:bg-gray-800">
          <Text className="mb-4 text-lg font-bold text-[#000000] dark:text-white">
            Account Information
          </Text>
          <View className="gap-4">
            <View>
              <Text className="mb-1 text-xs text-[#757575]">User ID</Text>
              <Text className="text-base font-medium text-[#000000] dark:text-white">{userId}</Text>
            </View>
            <View>
              <Text className="mb-1 text-xs text-[#757575]">Name</Text>
              <Text className="text-base font-medium text-[#000000] dark:text-white">
                {userName}
              </Text>
            </View>
            <View>
              <Text className="mb-1 text-xs text-[#757575]">Email</Text>
              <Text className="text-base font-medium text-[#000000] dark:text-white">
                {userMail}
              </Text>
            </View>
            <View>
              <Text className="mb-1 text-xs text-[#757575]">Phone</Text>
              <Text className="text-base font-medium text-[#000000] dark:text-white">
                {userPhone}
              </Text>
            </View>
            <View>
              <Text className="mb-1 text-xs text-[#757575]">Account Status</Text>
              <View className="flex-row items-center gap-2">
                <View
                  className={`h-2 w-2 rounded-full ${userActive ? "bg-green-500" : "bg-red-500"}`}
                />
                <Text className="text-base font-medium text-[#000000] dark:text-white">
                  {userActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mt-4">
          <Button
            className="w-full rounded-3xl bg-red-500 active:bg-red-600"
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
