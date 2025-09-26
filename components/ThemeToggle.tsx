import { Text } from "@/components/ui/text";
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Pressable, View } from "react-native";

export function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();

  const handleToggle = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <Pressable
      onPress={handleToggle}
      className="flex-row items-center justify-center rounded-full bg-gray-200 p-3 shadow-sm dark:bg-gray-700">
      <View className="mr-2">
        {isDark ? (
          // Moon icon for dark mode
          <Text className="text-xl">🌙</Text>
        ) : (
          // Sun icon for light mode
          <Text className="text-xl">☀️</Text>
        )}
      </View>
      <Text className="font-medium text-gray-800 dark:text-gray-200">
        {isDark ? "Dark" : "Light"} Mode
      </Text>
    </Pressable>
  );
}
