import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center px-6">
        {/* Theme Toggle */}
        <View className="absolute right-6 top-12">
          <ThemeToggle />
        </View>

        {/* Logo/Image */}
        <View className="mb-8 items-center">
          <Image
            source={require("@/assets/images/icon.png")}
            style={{ width: 120, height: 120 }}
            contentFit="contain"
            accessibilityLabel="App Icon"
          />
        </View>

        {/* Welcome Content */}
        <View className="mb-12 items-center">
          <Text className="mb-4 text-center text-4xl font-bold text-[#000000] dark:text-white">
            Welcome to Our App
          </Text>
          <Text className="text-center text-lg text-[#757575] dark:text-gray-300">
            Discover amazing features and seamless experience designed just for you
          </Text>
        </View>

        {/* Main Navigation Button */}
        <View className="w-full max-w-sm">
          <Button
            className="w-full bg-[#FF6D00] py-6 active:bg-[#FF4D00]"
            onPress={() => router.push("/welcome")}>
            <Text className="text-lg font-bold text-white">Get Started</Text>
          </Button>
        </View>

        {/* Quick Access Options */}
        <View className="mt-8 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-gray-600 dark:text-gray-300">Already have an account?</Text>
          <Button variant="ghost" onPress={() => router.push("/login")}>
            <Text className="text-sm font-semibold text-[#FF6D00]">Sign in</Text>
          </Button>
        </View>

        {/* Additional Content */}
        <View className="mt-12">
          <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
            Join thousands of users who trust our platform
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
