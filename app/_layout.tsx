import "@/global.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NAV_THEME } from "@/libs/theme";
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <NavigationThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            </Stack>
            <PortalHost />
            <Toast />
          </NavigationThemeProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
