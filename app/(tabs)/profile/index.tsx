import { Button } from "@/components/ui/button";

import { Text } from "@/components/ui/text";

import { USE_MOCK_DATA, mockAccounts } from "@/data/mockData";

import { useAuth } from "@/hooks/useAuth";

import { useGetMe } from "@/services/accountService";

import { MaterialIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

export default function ProfileTab() {
  const { user, logout } = useAuth();

  const router = useRouter();

  // Fetch full user profile from backend; fall back to minimal user or mock data

  const { data: me, isLoading: meLoading } = useGetMe();

  // Use mock account data if available - only if nothing else

  const mockUser =
    USE_MOCK_DATA && !user && !me && mockAccounts.length > 0 ? mockAccounts[0] : null;

  const displayUser = me || user || mockUser;

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

  // Safe string representations for rendering (avoid 'unknown' type issues)

  const userIdStr = String(userId ?? "N/A");

  const userNameStr = String(userName ?? "N/A");

  const userRoleStr = String(userRole ?? "N/A");

  const userMailStr = String(userMail ?? "Not available");

  const userPhoneStr = String(userPhone ?? "Not available");

  // Seed for DiceBear avatar: prefer id -> userId -> mail -> phone, else 'guest'

  const avatarSeed = displayUser
    ? "id" in displayUser
      ? String((displayUser as any).id)
      : "userId" in displayUser
        ? String((displayUser as any).userId)
        : "mail" in displayUser
          ? String((displayUser as any).mail)
          : "phone" in displayUser
            ? String((displayUser as any).phone)
            : "guest"
    : "guest";

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
    // Open the edit screen which lives outside the tabs group so it doesn't show in the tab bar

    router.push("/profile/edit");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header */}

        <View className="mb-6">
          <Text className="mb-2 text-3xl font-bold text-[#000000] dark:text-white">Profile</Text>

          <Text className="text-base text-gray-600 dark:text-gray-300">
            Manage your account settings
          </Text>
        </View>

        {/* Profile Card with orange background */}

        <View className="mb-6 overflow-hidden rounded-3xl bg-[#fa8832] p-6 shadow-lg">
          <View className="flex-row items-center justify-between">
            {/* Avatar and Info */}

            <View className="flex-1 flex-row items-center gap-4">
              <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-white/20">
                {meLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="large" />
                ) : (
                  <Image
                    source={{
                      uri: `https://api.dicebear.com/9.x/fun-emoji/png?seed=${encodeURIComponent(
                        avatarSeed
                      )}&size=80`,
                    }}
                    style={{ width: 80, height: 80, borderRadius: 999 }}
                    resizeMode="cover"
                  />
                )}
              </View>

              <View className="flex-1">
                <Text className="mb-2 text-2xl font-bold text-white">{userNameStr}</Text>

                <View className="self-start rounded-full bg-white/30 px-3 py-1">
                  <Text className="text-xs font-bold uppercase text-white">{userRoleStr}</Text>
                </View>
              </View>
            </View>

            {/* Edit Button */}

            <Pressable
              onPress={handleEditProfile}
              className="h-12 w-12 items-center justify-center rounded-full bg-white/30 active:bg-white/40">
              <MaterialIcons name="edit" size={24} color="black" />
            </Pressable>
          </View>

          {/* Stats Row */}

          <View className="mt-6 flex-row items-center justify-around border-t border-white/30 pt-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">0</Text>

              <Text className="text-sm text-white/90">Orders</Text>
            </View>

            <View className="h-10 w-px bg-white/30" />

            <View className="items-center">
              <Text className="text-2xl font-bold text-white">0</Text>

              <Text className="text-sm text-white/90">Points</Text>
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

              <Text className="text-base font-medium text-[#000000] dark:text-white">
                {userIdStr}
              </Text>
            </View>

            <View>
              <Text className="mb-1 text-xs text-[#757575]">Name</Text>

              <Text className="text-base font-medium text-[#000000] dark:text-white">
                {userNameStr}
              </Text>
            </View>

            <View>
              <Text className="mb-1 text-xs text-[#757575]">Email</Text>

              <Text className="text-base font-medium text-[#000000] dark:text-white">
                {userMailStr}
              </Text>
            </View>

            <View>
              <Text className="mb-1 text-xs text-[#757575]">Phone</Text>

              <Text className="text-base font-medium text-[#000000] dark:text-white">
                {userPhoneStr}
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

