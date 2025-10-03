import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center px-6">
        {/* Logo/Image */}
        <View className="mb-12 items-center">
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

        {/* Navigation Button */}
        <View className="w-full max-w-sm">
          <Button
            className="w-full bg-[#FF6D00] py-6 active:bg-[#FF4D00]"
            onPress={() => router.push("/intro-1")}>
            <Text className="text-lg font-bold text-white">Get Started</Text>
          </Button>
        </View>

        {/* Skip Option */}
        <Button variant="ghost" className="mt-6" onPress={() => router.push("/")}>
          <Text className="text-sm text-[#FF6D00]">Skip for now</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
