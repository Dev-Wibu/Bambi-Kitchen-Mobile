import React from "react";

import { ScrollView, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

import DonutProgress from "@/components/DonutProgress";

import { Text } from "@/components/ui/text";

import { useAuth } from "@/hooks/useAuth";

import { useAccounts } from "@/services/accountService";

import { useDishes } from "@/services/dishService";

import { useIngredients } from "@/services/ingredientService";

import { useNotifications } from "@/services/notificationService";

import { useOrders } from "@/services/orderService";

import { MaterialIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

export default function ManagerTab() {
  const { user, logout } = useAuth();

  const router = useRouter();

  const { data: notifications } = useNotifications();

  const hasUnread = Array.isArray(notifications) && notifications.some((n: any) => !n.read);

  const handleLogout = async () => {
    try {
      await logout();

      Toast.show({ type: "success", text1: "Logged out" });

      router.replace("/(auth)/login");
    } catch (err) {
      Toast.show({ type: "error", text1: "Logout failed" });
    }
  };

  function DashboardDonutsForManager() {
    const { data: dishesAPI } = useDishes();

    const { data: accountsAPI } = useAccounts();

    const { data: ingredientsAPI } = useIngredients();

    const { data: ordersAPI } = useOrders();

    const dishesCount = Array.isArray(dishesAPI) ? dishesAPI.length : 0;

    const accountsCount = Array.isArray(accountsAPI) ? accountsAPI.length : 0;

    const ingredientsCount = Array.isArray(ingredientsAPI) ? ingredientsAPI.length : 0;

    const ordersCount = Array.isArray(ordersAPI) ? ordersAPI.length : 0;

    const max = Math.max(dishesCount, accountsCount, ingredientsCount, ordersCount, 1);

    const items = [
      {
        key: "dishes",
        label: "Dishes",
        value: dishesCount,
        color: "#FF6B6B",
        route: "/manager/dishes",
      },

      {
        key: "accounts",
        label: "Accounts",
        value: accountsCount,
        color: "#34D399",
        route: "/manager/accounts",
      },

      {
        key: "ingredients",
        label: "Ingredients",
        value: ingredientsCount,
        color: "#60A5FA",
        route: "/manager/ingredients",
      },

      {
        key: "orders",
        label: "Orders",
        value: ordersCount,
        color: "#FBBF24",
        route: "/manager/orders",
      },
    ];

    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {items.map((it) => (
          <View key={it.key} style={{ width: "48%", marginBottom: 12 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(it.route)}
              style={{ alignItems: "center" }}>
              <View
                style={{
                  alignItems: "center",

                  backgroundColor: "#fff",

                  padding: 12,

                  borderRadius: 16,

                  borderWidth: 1,

                  borderColor: "#F3F4F6",
                }}>
                <DonutProgress
                  value={it.value}
                  total={max}
                  color={it.color}
                  size={116}
                  strokeWidth={10}
                  centerValueFontSize={20}
                />

                <Text style={{ marginTop: 8, fontSize: 13, fontWeight: "600", color: "#111827" }}>
                  {it.label}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#000" }}>
              Manager Dashboard
            </Text>

            <Text style={{ color: "#6B7280", marginTop: 4 }}>
              Welcome, {user?.name || "Manager"}!
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              onPress={() => router.push("/manager/notifications")}
              style={{ padding: 6 }}>
              <MaterialIcons name="notifications" size={22} color="#FF6D00" />

              {hasUnread ? (
                <View
                  style={{
                    position: "absolute",
                    right: -2,
                    top: -2,
                    height: 8,
                    width: 8,
                    borderRadius: 8,
                    backgroundColor: "#FF6D00",
                  }}
                />
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Logout"
              onPress={handleLogout}
              style={{ padding: 6 }}>
              <MaterialIcons name="logout" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#F3F4F6",
          }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <MaterialIcons name="admin-panel-settings" size={18} color="#FF6D00" />

            <Text style={{ marginLeft: 8, fontWeight: "600" }}>Administrator</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: "#F3F4F6",
              }}>
              <MaterialIcons name="person" size={14} color="#6B7280" />

              <Text style={{ marginLeft: 8 }}>{user?.name || "N/A"}</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: "#F3F4F6",
              }}>
              <MaterialIcons name="badge" size={14} color="#6B7280" />

              <Text style={{ marginLeft: 8 }}>ID: {user?.userId ?? "-"}</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: "#FFF7ED",
              }}>
              <MaterialIcons name="verified-user" size={14} color="#FF6D00" />

              <Text style={{ marginLeft: 8, color: "#FF6D00", fontWeight: "600" }}>
                {(user?.role || "N/A").toString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Overview</Text>

          <DashboardDonutsForManager />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
