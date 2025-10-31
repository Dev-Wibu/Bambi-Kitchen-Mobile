import { CustomTabBar } from "@/components/CustomTabBar";

import { useAuth } from "@/hooks/useAuth";

import { MaterialIcons } from "@expo/vector-icons";

import { Redirect, Tabs, useRouter } from "expo-router";

import { useEffect } from "react";

import { ActivityIndicator, View } from "react-native";

import Toast from "react-native-toast-message";

export default function ManagerLayout() {
  const { isLoggedIn, user, isLoading, logout } = useAuth();

  const router = useRouter();

  // Check if user is ADMIN - only ADMIN can access manager on mobile

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      if (user.role === "STAFF") {
        Toast.show({
          type: "info",

          text1: "Staff Access Not Available",

          text2: "Staff features are not available on mobile. Please use the web application.",

          visibilityTime: 5000,
        });
      } else {
        Toast.show({
          type: "info",

          text1: "Access Denied",

          text2: "Manager features require ADMIN role.",

          visibilityTime: 5000,
        });
      }

      // Logout and redirect to login

      setTimeout(() => {
        logout();

        router.replace("/(auth)/login");
      }, 2000);
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

  // If user is not ADMIN role, show loading while we logout

  if (user.role !== "ADMIN") {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
      </View>
    );
  }

  const hiddenRoutes = [
    "accounts/AccountForm",

    "discounts/DiscountForm",

    "dish-categories/DishCategoryForm",

    "ingredient-categories/IngredientCategoryForm",
  ];

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} hiddenRoutes={hiddenRoutes} />}
      screenOptions={{
        tabBarActiveTintColor: "#FF6D00",

        tabBarInactiveTintColor: "#9CA3AF",

        headerShown: false,
      }}
      initialRouteName="index">
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="accounts/index"
        options={{
          title: "Accounts",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="discounts/index"
        options={{
          title: "Discounts",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="local-offer" size={size} color={color} />
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
        name="dish-categories/index"
        options={{
          title: "Categories",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="category" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="dishes/index"
        options={{
          title: "Dishes",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant-menu" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden form screens */}

      <Tabs.Screen
        name="accounts/AccountForm"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="discounts/DiscountForm"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="dish-categories/DishCategoryForm"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="ingredient-categories/index"
        options={{
          title: "Ingredient Categories",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="science" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ingredient-categories/IngredientCategoryForm"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="inventory-transactions/index"
        options={{
          title: "Inventory",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="inventory" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

