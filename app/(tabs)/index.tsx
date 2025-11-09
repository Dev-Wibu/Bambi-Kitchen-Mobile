import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "expo-router";

export default function TabsIndexRedirect() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  const targetRoute =
    user.role === "STAFF" || user.role === "ADMIN" ? "/(tabs)/manager" : "/(tabs)/home";

  return <Redirect href={targetRoute} />;
}
