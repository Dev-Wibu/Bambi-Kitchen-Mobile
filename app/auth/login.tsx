import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log("Login attempt for email:", email);
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign-In
    console.log("Google Sign-In");
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
          <Text className="text-2xl font-bold text-black">
            <Text className="underline decoration-[#2196F3]">Login to your account</Text>
          </Text>
        </View>

        {/* Subtitle */}
        <Text className="mb-8 text-base font-normal text-[#333333]">
          Good to see you again, enter your details below to continue ordering.
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
        <View className="mb-12">
          <Text className="mb-1 text-base font-normal text-black">Password</Text>
          <Input
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="rounded-lg border border-gray-200"
          />
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
            onPress={handleLogin}
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
