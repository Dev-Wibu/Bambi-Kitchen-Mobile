import { CustomTabBar } from "@/components/CustomTabBar";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";

export default function TabsLayout() {
  const { isLoggedIn, user, isLoading, logout } = useAuth();
  const router = useRouter();

  // Check if user is STAFF role - they are blocked on mobile
  // ADMIN users should go to /manager, not (tabs)
  useEffect(() => {
    if (user) {
      if (user.role === "STAFF") {
        Toast.show({
          type: "info",
          text1: "Staff Access Not Available",
          text2: "Staff features are not available on mobile. Please use the web application.",
          visibilityTime: 5000,
        });
        // Logout and redirect to login
        setTimeout(() => {
          logout();
          router.replace("/(auth)/login");
        }, 2000);
      } else if (user.role === "ADMIN") {
        // Redirect ADMIN to manager interface
        router.replace("/manager");
      }
    }
  }, [user, logout, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // If user is STAFF role, show loading while we logout
  // If user is ADMIN, show loading while we redirect to manager
  if (user.role === "STAFF" || user.role === "ADMIN") {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
      </View>
    );
  }

  const hiddenRoutes = [
    "index",
    "manager/accounts/index",
    "manager/accounts/AccountForm",
    "manager/dish-categories/index",
    "manager/dish-categories/DishCategoryForm",
    "manager/ingredient-categories/index",
    "manager/ingredient-categories/IngredientCategoryForm",
    "manager/inventory-transactions/index",
    "manager/notifications/index",
    "manager/index", // Hide manager tab for all mobile users
  ];

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} hiddenRoutes={hiddenRoutes} />}
      screenOptions={{
        tabBarActiveTintColor: "#FF6D00",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
      }}
      initialRouteName="home/index">
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu/index"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant-menu" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="order/index"
        options={{
          title: "Order",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt-long" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
      {/* Manager tab hidden for mobile - not deployed */}
    </Tabs>
  );
}
