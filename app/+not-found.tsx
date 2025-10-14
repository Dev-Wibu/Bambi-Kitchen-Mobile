import { Text } from "@/components/ui/text";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function NotFound() {
  const isDark = useColorScheme() === "dark";

  return (
    <LinearGradient
      colors={isDark ? ["#0F172A", "#1F2937"] : ["#FFF4E6", "#FFE1C6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-between px-6 py-10">
          <View className="items-center">
            <LinearGradient
              colors={["rgba(255,138,0,0.35)", "rgba(255,109,0,0.1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 32, padding: 3 }}>
              <View className="h-28 w-28 items-center justify-center rounded-[28px] bg-white/90 shadow-2xl dark:bg-gray-900/80">
                <Feather name="compass" size={44} color="#FF6D00" />
              </View>
            </LinearGradient>

            <Text className="mt-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Không tìm thấy trang
            </Text>
            <Text className="mt-3 max-w-md text-center text-base leading-relaxed text-gray-600 dark:text-gray-300">
              Có vẻ như bạn đã truy cập vào một đường dẫn chưa tồn tại hoặc trang đã được di chuyển.
              Hãy quay về trang chính để tiếp tục trải nghiệm.
            </Text>
          </View>

          <View className="mt-12 items-center space-y-4">
            <Pressable
              className="w-full max-w-sm"
              onPress={() => router.replace({ pathname: "/" })}>
              <LinearGradient
                colors={["#FF8A00", "#FF6D00"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 24 }}>
                <View className="items-center justify-center py-4">
                  <Text className="text-lg font-semibold text-white">Quay về Trang chủ</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable
              className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/60 py-4 dark:border-gray-700 dark:bg-gray-800/70"
              onPress={() => router.back()}>
              <Text className="text-center text-lg font-semibold text-[#FF6D00] dark:text-[#FF8A00]">
                Quay lại trang trước
              </Text>
            </Pressable>

            <View className="w-full max-w-sm rounded-3xl border border-white/30 bg-white/50 px-5 py-4 dark:border-gray-700/60 dark:bg-gray-900/70">
              <Text className="text-center text-sm text-gray-600 dark:text-gray-300">
                Cần hỗ trợ thêm? Gửi phản hồi trong mục Hỗ trợ tại hồ sơ để đội ngũ chúng tôi xử lý.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
