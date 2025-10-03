import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IntroThree() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-between px-6 py-8">
        {/* Progress Indicator */}
        <View className="flex-row gap-2">
          <View className="h-2 w-8 rounded-full bg-[#FF6D00]" />
          <View className="h-2 w-8 rounded-full bg-[#FF6D00]" />
          <View className="h-2 w-8 rounded-full bg-[#FF6D00]" />
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-center">
          {/* Feature Image */}
          <View className="mb-12 items-center">
            <Image
              source={require("@/assets/images/favicon.png")}
              style={{ width: 200, height: 200 }}
              contentFit="contain"
              accessibilityLabel="Get started illustration"
            />
          </View>

          {/* Feature Description */}
          <View className="items-center">
            <Text className="mb-4 text-center text-3xl font-bold text-[#000000] dark:text-white">
              Ready to Begin?
            </Text>
            <Text className="text-center text-lg text-[#757575] dark:text-gray-300">
              Join thousands of users and start your journey with us today
            </Text>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="w-full max-w-sm gap-4">
          <Button
            className="w-full bg-[#FF6D00] py-6 active:bg-[#FF4D00]"
            onPress={() => router.push("/login")}>
            <Text className="text-lg font-bold text-white">Get Started</Text>
          </Button>

          <Button variant="ghost" onPress={() => router.back()}>
            <Text className="text-sm text-[#757575]">Back</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
