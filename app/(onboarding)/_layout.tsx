import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="intro-1" options={{ headerShown: false }} />
      <Stack.Screen name="intro-2" options={{ headerShown: false }} />
      <Stack.Screen name="intro-3" options={{ headerShown: false }} />
    </Stack>
  );
}
