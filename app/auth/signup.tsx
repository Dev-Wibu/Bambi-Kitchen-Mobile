import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { registerFormSchema, type RegisterFormSchemaType } from "@/lib/validation";
import { transformRegisterRequest, useRegisterAccount } from "@/services/accountService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, SafeAreaView, ScrollView, View } from "react-native";

export default function SignupScreen() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const registerQuery = useRegisterAccount();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormSchemaType>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      mail: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignup = (data: RegisterFormSchemaType) => {
    setError(null);
    setMessage(null);

    try {
      // Transform and validate the data
      transformRegisterRequest(data);

      // Simulate successful registration for demo purposes
      // In real implementation, this would call registerQuery.mutate(registerData);
      setMessage("Account created successfully! You can now login.");
      Alert.alert("Success", "Account created successfully! You can now login.");
      reset();

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const handleGoogleSignUp = () => {
    // TODO: Implement Google Sign-Up
    console.log("Google Sign-Up");
  };

  const handleSkip = () => {
    router.push("/");
  };

  useEffect(() => {
    if (registerQuery.isSuccess) {
      setMessage("Account created successfully! You can now login.");
      Alert.alert("Success", "Account created successfully! You can now login.");
      reset();
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } else if (registerQuery.isError) {
      const errorMessage =
        registerQuery.error instanceof Error
          ? registerQuery.error.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
    }
  }, [registerQuery.isSuccess, registerQuery.isError, registerQuery.error, reset]);

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
          <Text className="text-2xl font-bold text-black">Create an account</Text>
        </View>

        {/* Subtitle */}
        <Text className="mb-8 text-base font-normal text-[#333333]">
          Welcome friend, enter your details so let&apos;s get started in ordering food.
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

        {/* Name Field */}
        <View className="mb-5">
          <Text className="mb-1 text-base font-normal text-black">Full Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className="rounded-lg border border-gray-200"
              />
            )}
          />
          {errors.name && <Text className="mt-1 text-sm text-red-600">{errors.name.message}</Text>}
        </View>

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
        <View className="mb-5">
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

        {/* Confirm Password Field */}
        <View className="mb-12">
          <Text className="mb-1 text-base font-normal text-black">Confirm Password</Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Confirm Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                className="rounded-lg border border-gray-200"
              />
            )}
          />
          {errors.confirmPassword && (
            <Text className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</Text>
          )}
        </View>

        {/* Google Sign-Up Button */}
        <View className="mb-8">
          <Pressable
            onPress={handleGoogleSignUp}
            className="flex-row items-center justify-center rounded-3xl border border-[#DDDDDD] bg-white px-4 py-3 shadow-sm">
            {/* Google Icon placeholder - in a real app, you'd use the actual Google logo */}
            <View className="mr-3 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
            <Text className="text-base font-normal text-black">Sign-up with Google</Text>
          </Pressable>
        </View>

        {/* Create Account Button */}
        <View className="mb-5">
          <Button
            onPress={handleSubmit(handleSignup)}
            className="w-full rounded-3xl bg-gradient-to-r from-[#8BC34A] to-[#4CAF50] py-4 shadow-sm">
            <Text className="text-lg font-bold text-white">Create an account</Text>
          </Button>
        </View>

        {/* Login Link */}
        <View className="mb-10 items-center">
          <Link href="/auth/login" asChild>
            <Pressable>
              <Text className="text-base font-normal text-[#4CAF50]">Login to my account</Text>
            </Pressable>
          </Link>
        </View>

        {/* Bottom White Space */}
        <View className="h-40" />
      </ScrollView>
    </SafeAreaView>
  );
}
