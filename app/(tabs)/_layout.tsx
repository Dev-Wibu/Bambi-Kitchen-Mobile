import { CustomTabBar } from "@/components/CustomTabBar";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function TabsLayout() {
  const { isLoggedIn, user, isLoading } = useAuth();

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

  const canAccessManager = user.role === "ADMIN" || user.role === "STAFF";

  const hiddenRoutes = [
    "index",
    "cart/index",
    "manager/accounts/index",
    "manager/accounts/AccountForm",
    "manager/discounts/index",
    "manager/discounts/DiscountForm",
    "manager/dish-categories/index",
    "manager/dish-categories/DishCategoryForm",
    "manager/ingredient-categories/index",
    "manager/ingredient-categories/IngredientCategoryForm",
    "manager/inventory-transactions/index",
    "manager/notifications/index",
    ...(canAccessManager ? [] : ["manager/index"]),
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
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
      {canAccessManager ? (
        <Tabs.Screen
          name="manager/index"
          options={{
            title: "Manager",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="dashboard" size={size} color={color} />
            ),
          }}
        />
      ) : null}
    </Tabs>
  );
}
