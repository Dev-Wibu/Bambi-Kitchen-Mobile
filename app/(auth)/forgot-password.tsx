import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const validatePhoneNumber = (phone: string) => {
  const phoneRegex = /^(\+84|0)[35789]\d{8}$/;
  return phoneRegex.test(phone);
};

export default function ForgotPassword() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!phone) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter the phone number associated with your account",
      });
      return;
    }

    if (!validatePhoneNumber(phone)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid Vietnamese phone number (e.g., 0912345678)",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // MOCKAPI: No backend yet, simulate success feedback
      await new Promise((resolve) => setTimeout(resolve, 800));

      Toast.show({
        type: "success",
        text1: "Request Received",
        text2: "If the phone number exists, you'll receive reset instructions shortly.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="min-h-full">
        <View className="flex-1 px-6 py-8">
          <View className="mb-6">
            <Text className="text-3xl font-bold text-[#000000] dark:text-white">
              Forgot Password
            </Text>
            <Text className="mt-2 text-base text-gray-600 dark:text-gray-300">
              Enter your phone number and we'll send instructions to reset your password.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="text-sm font-medium text-[#757575]">Phone Number</Text>
            <Input
              placeholder="0912345678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <View className="mt-6 gap-4">
            <Button
              className="w-full rounded-3xl bg-[#FF6D00] active:bg-[#FF4D00]"
              disabled={isSubmitting}
              onPress={handleSubmit}>
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-bold text-white">Send Instructions</Text>
              )}
            </Button>

            <Button
              variant="outline"
              className="border-[#FF6D00]"
              onPress={() => router.push("/login")}>
              <Text className="text-lg font-semibold text-[#FF6D00]">Back to Login</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
