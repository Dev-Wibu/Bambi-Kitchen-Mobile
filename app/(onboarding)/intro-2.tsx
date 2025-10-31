import { Button } from "@/components/ui/button";

import { Text } from "@/components/ui/text";

import { Image } from "expo-image";

import { useRouter } from "expo-router";

import { View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function IntroTwo() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Feature Image - Sát trên cùng */}

      <View className="items-center">
        <Image
          source={require("@/assets/images/intro-2.jpg")}
          style={{
            width: 600,

            height: 615,

            borderBottomLeftRadius: 450,

            borderBottomRightRadius: 450,
          }}
          contentFit="contain"
          accessibilityLabel="Security illustration"
        />
      </View>

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          {/* Content - Ở giữa */}

          <View className="flex-1 items-center justify-center">
            {/* Feature Description */}

            <View className="mb-6 items-center px-4">
              <Text className="mb-0 text-center text-2xl font-bold text-[#FF6D00]">
                Taste fresh delicious meals
              </Text>

              <Text className="text-center text-lg text-[#757575] dark:text-gray-300">
                anytime and anywhere
              </Text>
            </View>

            {/* Progress Indicator */}

            <View className="flex-row gap-2">
              <View className="h-2 w-8 rounded-full bg-[#FF6D00]" />

              <View className="h-2 w-8 rounded-full bg-[#FF6D00]" />

              <View className="h-2 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
            </View>
          </View>

          {/* Navigation Buttons - Ở dưới cùng */}

          <View className="mx-auto w-full max-w-sm gap-2">
            <Button
              className="w-full rounded-3xl bg-[#FF6D00] active:bg-[#FF4D00]"
              onPress={() => router.push("/intro-3")}>
              <Text className="text-lg font-bold text-white">NEXT</Text>
            </Button>

            <View className="w-full max-w-sm flex-row justify-between gap-2">
              <Button variant="ghost" onPress={() => router.back()}>
                <Text className="text-sm font-semibold text-[#757575]">BACK</Text>
              </Button>

              <Button variant="ghost" onPress={() => router.push("/login")}>
                <Text className="text-sm font-semibold text-[#FF6D00]">SKIP</Text>
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

