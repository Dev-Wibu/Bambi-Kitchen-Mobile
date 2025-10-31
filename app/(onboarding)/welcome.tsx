import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Welcome() {
  const router = useRouter();

  return (
    <View className="flex-1">
      {/* Background Image - Full Screen */}
      <Image
        source={require("@/assets/images/welcome.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        contentFit="cover"
        accessibilityLabel="Welcome Background"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      />

      {/* Content */}
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-end px-6 pb-4">
          {/* Welcome Content */}
          <View className="mb-1 items-center">
            <Text className="mb-0 text-center text-5xl font-bold text-white">Welcome to</Text>

            {/* App Logo thay cho text "Bambi Kitchen" */}
            <Image
              source={require("@/assets/images/favicon.png")}
              style={{ width: 160, height: 160, marginBottom: 2 }}
              contentFit="cover"
              accessibilityLabel="Bambi Kitchen Logo"
            />
          </View>

          {/* Navigation Button */}
          <View className="w-full max-w-md">
            <Button
              className="w-full rounded-3xl bg-[#FC8A06] active:bg-[#FF4D00]"
              onPress={() => router.push("/intro-1")}>
              <Text className="text-lg font-bold text-white">Get Started</Text>
            </Button>
          </View>

          {/* Skip Option */}
          <Button variant="ghost" className="mt-2" onPress={() => router.push("/login")}>
            <Text className="text-sm font-semibold text-white">Skip for now</Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}
