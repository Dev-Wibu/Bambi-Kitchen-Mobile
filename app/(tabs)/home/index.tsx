import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/stores/cartStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Sample products for demonstration
const SAMPLE_PRODUCTS = [
  { id: 1, name: "Grilled Chicken", price: 12.99, image: undefined },
  { id: 2, name: "Beef Burger", price: 10.99, image: undefined },
  { id: 3, name: "Caesar Salad", price: 8.99, image: undefined },
];

export default function HomeTab() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { addItem, getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();

  const handleLogout = async () => {
    try {
      await logout();
      Toast.show({
        type: "success",
        text1: "Logged out",
        text2: "You have been successfully logged out",
      });
      router.replace("/(auth)/login");
    } catch {
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: "An error occurred while logging out",
      });
    }
  };

  const handleAddToCart = (product: (typeof SAMPLE_PRODUCTS)[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    Toast.show({
      type: "success",
      text1: "Added to Cart",
      text2: `${product.name} has been added to your cart`,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header with Cart Badge */}
        <View className="mb-8">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-[#000000] dark:text-white">
              Welcome, {user?.name || "User"}!
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/cart")}
              className="relative rounded-full bg-[#FF6D00] p-3">
              <MaterialIcons name="shopping-cart" size={24} color="white" />
              {cartItemCount > 0 && (
                <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                  <Text className="text-xs font-bold text-white">{cartItemCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
          <Text className="text-base text-gray-600 dark:text-gray-300">
            You are logged in as a User
          </Text>
        </View>

        {/* User Info Card */}
        <View className="mb-6 rounded-2xl bg-gray-50 p-6 dark:bg-gray-800">
          <View className="mb-4 flex-row items-center">
            <MaterialIcons name="person" size={24} color="#FF6D00" />
            <Text className="ml-2 text-lg font-semibold text-[#000000] dark:text-white">
              User Information
            </Text>
          </View>
          <View className="gap-3">
            <View>
              <Text className="text-sm text-[#757575]">Name</Text>
              <Text className="text-base font-medium text-[#000000] dark:text-white">
                {user?.name || "N/A"}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-[#757575]">User ID</Text>
              <Text className="text-base font-medium text-[#000000] dark:text-white">
                {user?.userId || "N/A"}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-[#757575]">Role</Text>
              <Text className="text-base font-medium text-[#FF6D00]">{user?.role || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Featured Products */}
        <View className="mb-6">
          <Text className="mb-4 text-xl font-bold text-[#000000] dark:text-white">
            Featured Items
          </Text>
          <View className="gap-4">
            {SAMPLE_PRODUCTS.map((product) => (
              <View
                key={product.id}
                className="flex-row items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <View className="mr-4 h-16 w-16 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700">
                  <MaterialIcons name="restaurant" size={32} color="#FF6D00" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-semibold text-[#000000] dark:text-white">
                    {product.name}
                  </Text>
                  <Text className="text-lg font-bold text-[#FF6D00]">
                    ${product.price.toFixed(2)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleAddToCart(product)}
                  className="rounded-full bg-[#FF6D00] p-2 active:bg-[#FF4D00]">
                  <MaterialIcons name="add-shopping-cart" size={20} color="white" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View className="mb-6">
          <Text className="mb-4 text-xl font-bold text-[#000000] dark:text-white">
            Quick Actions
          </Text>
          <View className="gap-4">
            <View className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <View className="mb-2 flex-row items-center">
                <MaterialIcons name="restaurant" size={20} color="#FF6D00" />
                <Text className="ml-2 text-base font-semibold text-[#000000] dark:text-white">
                  Browse Menu
                </Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                Explore our delicious menu items
              </Text>
            </View>

            <View className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <View className="mb-2 flex-row items-center">
                <MaterialIcons name="shopping-cart" size={20} color="#FF6D00" />
                <Text className="ml-2 text-base font-semibold text-[#000000] dark:text-white">
                  My Orders
                </Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                View your order history and status
              </Text>
            </View>

            <View className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <View className="mb-2 flex-row items-center">
                <MaterialIcons name="local-offer" size={20} color="#FF6D00" />
                <Text className="ml-2 text-base font-semibold text-[#000000] dark:text-white">
                  Special Offers
                </Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                Check out exclusive deals and discounts
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mt-auto pt-6">
          <Button
            className="w-full rounded-3xl bg-red-500 active:bg-red-600"
            onPress={handleLogout}>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="logout" size={20} color="white" />
              <Text className="text-lg font-bold text-white">Logout</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
