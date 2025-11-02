import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { API_BASE_URL } from "@/libs/api";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const validateEmail = (email: string) => {
  const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;
  return emailRegex.test(email);
};

type Step = "email" | "otp" | "reset";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter your email address",
      });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid email address",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Note: Using raw fetch here because the backend endpoint uses GET with query params
      // for an action endpoint (sending OTP), which doesn't fit the standard $api pattern
      const response = await fetch(
        `${API_BASE_URL}/api/user/forgot-password?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send OTP");
      }

      Toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: "Please check your email for the verification code",
      });
      setStep("otp");
    } catch (error) {
      console.error("Send OTP error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to send OTP",
        text2: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter the OTP code",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Note: Using raw fetch here to match the backend API signature which uses query params
      const response = await fetch(
        `${API_BASE_URL}/api/mail/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Invalid OTP");
      }

      Toast.show({
        type: "success",
        text1: "OTP Verified",
        text2: "Please enter your new password",
      });
      setStep("reset");
    } catch (error) {
      console.error("Verify OTP error:", error);
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error instanceof Error ? error.message : "Invalid or expired OTP",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter both password fields",
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Password must be at least 6 characters long",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Passwords do not match",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Note: Backend API uses query parameters for password reset (not ideal but backend design)
      // The password is sent via HTTPS so it's encrypted in transit
      const response = await fetch(
        `${API_BASE_URL}/api/user/reset-password?otp=${encodeURIComponent(otp)}&email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to reset password");
      }

      Toast.show({
        type: "success",
        text1: "Password Reset Successful",
        text2: "You can now login with your new password",
      });

      // Navigate to login after a short delay
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error) {
      console.error("Reset password error:", error);
      Toast.show({
        type: "error",
        text1: "Password Reset Failed",
        text2: error instanceof Error ? error.message : "Please try again",
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
              {step === "email" && "Forgot Password"}
              {step === "otp" && "Verify OTP"}
              {step === "reset" && "Reset Password"}
            </Text>
            <Text className="mt-2 text-base text-gray-600 dark:text-gray-300">
              {step === "email" && "Enter your email to receive a verification code"}
              {step === "otp" && "Enter the OTP code sent to your email"}
              {step === "reset" && "Enter your new password"}
            </Text>
          </View>

          {/* Step 1: Email Input */}
          {step === "email" && (
            <>
              <View className="gap-3">
                <Text className="text-sm font-medium text-[#757575]">Email Address</Text>
                <Input
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View className="mt-6 gap-4">
                <Button
                  className="w-full rounded-3xl bg-[#FF6D00] active:bg-[#FF4D00]"
                  disabled={isSubmitting}
                  onPress={handleSendOTP}>
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-lg font-bold text-white">Send OTP</Text>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="border-[#FF6D00]"
                  style={{ borderWidth: 1, height: 42, borderRadius: 24 }}
                  onPress={() => router.push("/login")}>
                  <Text className="text-lg font-semibold text-[#FF6D00]">Back to Login</Text>
                </Button>
              </View>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <>
              <View className="gap-3">
                <Text className="text-sm font-medium text-[#757575]">OTP Code</Text>
                <Input
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View className="mt-6 gap-4">
                <Button
                  className="w-full rounded-3xl bg-[#FF6D00] active:bg-[#FF4D00]"
                  disabled={isSubmitting}
                  onPress={handleVerifyOTP}>
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-lg font-bold text-white">Verify OTP</Text>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="border-[#FF6D00]"
                  style={{ borderWidth: 1, height: 42, borderRadius: 24 }}
                  onPress={() => setStep("email")}>
                  <Text className="text-lg font-semibold text-[#FF6D00]">Back</Text>
                </Button>
              </View>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <>
              <View className="gap-4">
                <View className="gap-2">
                  <Text className="text-sm font-medium text-[#757575]">New Password</Text>
                  <View className="relative">
                    <Input
                      placeholder="Enter new password"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword ? (
                        <EyeOff size={20} color="#9CA3AF" />
                      ) : (
                        <Eye size={20} color="#9CA3AF" />
                      )}
                    </Pressable>
                  </View>
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-medium text-[#757575]">Confirm Password</Text>
                  <View className="relative">
                    <Input
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <Pressable
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showConfirmPassword ? (
                        <EyeOff size={20} color="#9CA3AF" />
                      ) : (
                        <Eye size={20} color="#9CA3AF" />
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>

              <View className="mt-6 gap-4">
                <Button
                  className="w-full rounded-3xl bg-[#FF6D00] active:bg-[#FF4D00]"
                  disabled={isSubmitting}
                  onPress={handleResetPassword}>
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-lg font-bold text-white">Reset Password</Text>
                  )}
                </Button>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
