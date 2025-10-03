import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IntroOne() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-between px-6 py-8">
        {/* Progress Indicator */}
        <View className="flex-row gap-2">
          <View className="h-2 w-8 rounded-full bg-[#FF6D00]" />
          <View className="h-2 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
          <View className="h-2 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-center">
          {/* Feature Image */}
          <View className="mb-12 items-center">
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={{ width: 200, height: 200 }}
              contentFit="contain"
              accessibilityLabel="Feature illustration"
            />
          </View>

          {/* Feature Description */}
          <View className="items-center">
            <Text className="mb-4 text-center text-3xl font-bold text-[#000000] dark:text-white">
              Easy to Use
            </Text>
            <Text className="text-center text-lg text-[#757575] dark:text-gray-300">
              Intuitive interface designed for seamless navigation and effortless user experience
            </Text>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="w-full max-w-sm gap-4">
          <Button
            className="w-full bg-[#FF6D00] py-6 active:bg-[#FF4D00]"
            onPress={() => router.push("/intro-2")}>
            <Text className="text-lg font-bold text-white">Next</Text>
          </Button>

          <Button variant="ghost" onPress={() => router.push("/")}>
            <Text className="text-sm text-[#FF6D00]">Skip</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
