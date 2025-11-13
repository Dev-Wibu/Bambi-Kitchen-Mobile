import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useGetAccountById, useGetMe, useUpdateAccount } from "@/services/accountService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: me, isLoading: meLoading } = useGetMe();

  // Get full account data including password
  const userId = (me as any)?.id || (me as any)?.userId;
  const { data: accountData, isLoading: accountLoading } = useGetAccountById(userId);

  const updateMutation = useUpdateAccount();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (me) {
      setName((me as any).name || "");
      setEmail((me as any).mail || "");
      setPhone((me as any).phone || "");
      setActive((me as any).active ?? true);
    }
  }, [me]);

  const validatePhone = (phoneStr: string): boolean => {
    if (!phoneStr || phoneStr.trim() === "") return true;
    const phoneRegex = /^(\+84|84|0)[0-9]{9,10}$/;
    return phoneRegex.test(phoneStr.trim());
  };

  const handleSubmit = async () => {
    if (!me) {
      return;
    }

    const id = (me as any).id || (me as any).userId;

    if (!id) {
      Toast.show({ type: "error", text1: "Error", text2: "Missing user id" });
      return;
    }

    if (phone && !validatePhone(phone)) {
      Toast.show({
        type: "error",
        text1: "Invalid phone number",
        text2: "Phone must be 10-11 digits (e.g., 0912345678 or +84912345678)",
      });
      return;
    }

    // Get password from account data (GET /api/account/{id} returns full Account with password)
    const accountPassword = (accountData as any)?.password;

    if (!accountPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to load account password. Please try again.",
      });
      return;
    }

    // Backend requires password field to update profile
    const payload: any = {
      id: Number(id),
      name: name.trim() || (me as any).name || "",
      mail: email.trim() || (me as any).mail || "",
      phone: phone?.trim() || (me as any).phone || "",
      password: accountPassword, // Use existing password from GET /api/account/{id}
      role: (me as any).role || "USER",
      active: !!active,
    };

    try {
      await updateMutation.mutateAsync({ body: payload });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["get", "/api/user/me"] });
      router.back();
    } catch (e: any) {
      let msg = "Update failed";
      if (e?.response?.data?.message) {
        msg = e.response.data.message;
      } else if (e?.message) {
        msg = e.message;
      }

      Toast.show({ type: "error", text1: "Update failed", text2: msg });
    }
  };

  if (meLoading || accountLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
        <Text className="mt-4 text-base text-gray-600 dark:text-gray-300">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        <View className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <MaterialIcons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                Edit Profile
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Update your profile information
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="p-6">
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Name</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Email</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Phone</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Phone"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View className="mt-6 gap-3">
            <Button
              className="w-full bg-[#FF6D00] active:bg-[#FF4D00]"
              onPress={handleSubmit}
              disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-bold text-white">Save</Text>
              )}
            </Button>

            <Button className="w-full bg-gray-300 active:bg-gray-400" onPress={() => router.back()}>
              <Text className="text-lg font-bold text-[#000000]">Cancel</Text>
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
