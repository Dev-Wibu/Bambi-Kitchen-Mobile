import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = () => {
    // TODO: Implement signup logic
    if (password !== confirmPassword) {
      console.log("Passwords don't match");
      return;
    }
    console.log("Signup attempt for email:", email);
  };

  const handleGoogleSignUp = () => {
    // TODO: Implement Google Sign-Up
    console.log("Google Sign-Up");
  };

  const handleSkip = () => {
    router.push("/");
  };

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

        {/* Email Field */}
        <View className="mb-5">
          <Text className="mb-1 text-base font-normal text-black">Email Address</Text>
          <Input
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="rounded-lg border border-gray-200"
          />
        </View>

        {/* Password Field */}
        <View className="mb-5">
          <Text className="mb-1 text-base font-normal text-black">Password</Text>
          <Input
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="rounded-lg border border-gray-200"
          />
        </View>

        {/* Confirm Password Field */}
        <View className="mb-12">
          <Text className="mb-1 text-base font-normal text-black">Confirm Password</Text>
          <Input
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            className="rounded-lg border border-gray-200"
          />
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
            onPress={handleSignup}
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
