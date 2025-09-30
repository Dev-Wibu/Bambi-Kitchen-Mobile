import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/AuthContext";
import { loginFormSchema, type LoginFormSchemaType } from "@/lib/validation";
import { transformLoginRequest, useAuthCheck } from "@/services/accountService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, SafeAreaView, ScrollView, View } from "react-native";

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const authCheckQuery = useAuthCheck();
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchemaType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      mail: "",
      password: "",
    },
  });

  const handleLogin = (data: LoginFormSchemaType) => {
    setError(null);
    setMessage(null);

    try {
      const loginData = transformLoginRequest(data);
      console.log("Login attempt for email:", loginData.mail);

      // Simulate successful login for demo purposes
      // In real implementation, this would be after successful API call
      const mockAccount = {
        id: 1,
        name: "Demo User",
        mail: loginData.mail,
        role: "USER" as const,
        createAt: new Date().toISOString(),
        updateAt: new Date().toISOString(),
        active: true,
      };

      login(mockAccount);
      setMessage("Login successful!");
      Alert.alert("Success", `Welcome back, ${mockAccount.name}!`);

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign-In
    console.log("Google Sign-In");
  };

  const handleSkip = () => {
    router.push("/");
  };

  useEffect(() => {
    if (authCheckQuery.isSuccess) {
      setMessage("Authentication successful!");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else if (authCheckQuery.isError) {
      const errorMessage =
        authCheckQuery.error instanceof Error
          ? authCheckQuery.error.message
          : "Authentication failed. Please try again.";
      setError(errorMessage);
    }
  }, [authCheckQuery.isSuccess, authCheckQuery.isError, authCheckQuery.error]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5">
        {/* Skip Button */}
        <View className="flex-row justify-end pb-6 pt-3">
          <Pressable onPress={handleSkip}>
            <Text className="text-sm font-normal text-[#4CAF50]">Skip</Text>
          </Pressable>
        </View>

        {/* Main Title */}
        <View className="mb-2">
          <Text className="text-2xl font-bold text-black">
            <Text className="underline decoration-[#2196F3]">Login to your account</Text>
          </Text>
        </View>

        {/* Subtitle */}
        <Text className="mb-8 text-base font-normal text-[#333333]">
          Welcome back, enter your credentials to access your account.
        </Text>

        {/* Error Message */}
        {error && (
          <View className="mb-4 rounded-lg bg-red-100 p-3">
            <Text className="text-red-700">{error}</Text>
          </View>
        )}

        {/* Success Message */}
        {message && (
          <View className="mb-4 rounded-lg bg-green-100 p-3">
            <Text className="text-green-700">{message}</Text>
          </View>
        )}

        {/* Email Field */}
        <View className="mb-5">
          <Text className="mb-1 text-base font-normal text-black">Email Address</Text>
          <Controller
            control={control}
            name="mail"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                className="rounded-lg border border-gray-200"
              />
            )}
          />
          {errors.mail && <Text className="mt-1 text-sm text-red-600">{errors.mail.message}</Text>}
        </View>

        {/* Password Field */}
        <View className="mb-12">
          <Text className="mb-1 text-base font-normal text-black">Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                className="rounded-lg border border-gray-200"
              />
            )}
          />
          {errors.password && (
            <Text className="mt-1 text-sm text-red-600">{errors.password.message}</Text>
          )}
        </View>

        {/* Google Sign-In Button */}
        <View className="mb-8">
          <Pressable
            onPress={handleGoogleSignIn}
            className="flex-row items-center justify-center rounded-3xl border border-[#DDDDDD] bg-white px-4 py-3 shadow-sm">
            {/* Google Icon placeholder - in a real app, you'd use the actual Google logo */}
            <View className="mr-3 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
            <Text className="text-base font-normal text-black">Sign-In with Google</Text>
          </Pressable>
        </View>

        {/* Login Button */}
        <View className="mb-5">
          <Button
            onPress={handleSubmit(handleLogin)}
            className="w-full rounded-3xl bg-gradient-to-r from-[#8BC34A] to-[#4CAF50] py-4 shadow-sm">
            <Text className="text-lg font-bold text-white">Login to my account</Text>
          </Button>
        </View>

        {/* Create Account Link */}
        <View className="mb-10 items-center">
          <Link href="/auth/signup" asChild>
            <Pressable>
              <Text className="text-base font-normal text-[#4CAF50]">Create an account</Text>
            </Pressable>
          </Link>
        </View>

        {/* Bottom White Space */}
        <View className="h-40" />
      </ScrollView>
    </SafeAreaView>
  );
}
