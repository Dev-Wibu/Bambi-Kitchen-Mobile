import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCartStore } from "@/stores/cartStore";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartTab() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="mb-2 text-3xl font-bold text-[#000000] dark:text-white">Cart</Text>
            <Text className="text-base text-gray-600 dark:text-gray-300">Your shopping cart</Text>
          </View>

          {/* Empty Cart */}
          <View className="flex-1 items-center justify-center py-12">
            <MaterialIcons name="shopping-cart" size={80} color="#E5E7EB" />
            <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
              Your cart is empty
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-500">
              Add items to your cart to see them here
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="mb-2 text-3xl font-bold text-[#000000] dark:text-white">Cart</Text>
          <Text className="text-base text-gray-600 dark:text-gray-300">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </Text>
        </View>

        {/* Cart Items */}
        <View className="mb-6 gap-4">
          {items.map((item) => (
            <View
              key={item.id}
              className="flex-row gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
              {/* Item Image */}
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 80, height: 80 }}
                  className="rounded-xl"
                />
              ) : (
                <View className="h-20 w-20 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700">
                  <MaterialIcons name="restaurant" size={32} color="#9CA3AF" />
                </View>
              )}

              {/* Item Details */}
              <View className="flex-1">
                <Text className="mb-1 text-base font-semibold text-[#000000] dark:text-white">
                  {item.name}
                </Text>
                <Text className="mb-2 text-lg font-bold text-[#FF6D00]">
                  ${item.price.toFixed(2)}
                </Text>

                {/* Quantity Controls */}
                <View className="flex-row items-center gap-3">
                  <Pressable
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    <MaterialIcons name="remove" size={18} color="#000000" />
                  </Pressable>
                  <Text className="text-base font-semibold text-[#000000] dark:text-white">
                    {item.quantity}
                  </Text>
                  <Pressable
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    <MaterialIcons name="add" size={18} color="#000000" />
                  </Pressable>
                </View>
              </View>

              {/* Remove Button */}
              <Pressable
                onPress={() => removeItem(item.id)}
                className="items-center justify-center p-2">
                <MaterialIcons name="delete" size={24} color="#EF4444" />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View className="mb-6 rounded-2xl bg-gray-50 p-6 dark:bg-gray-800">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base text-gray-600 dark:text-gray-300">Subtotal</Text>
            <Text className="text-lg font-semibold text-[#000000] dark:text-white">
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
          <View className="mb-4 flex-row items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <Text className="text-lg font-bold text-[#000000] dark:text-white">Total</Text>
            <Text className="text-2xl font-bold text-[#FF6D00]">${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <Button className="w-full rounded-3xl bg-[#FF6D00] active:bg-[#FF4D00]">
            <Text className="text-lg font-bold text-white">Checkout</Text>
          </Button>
          <Button
            onPress={clearCart}
            className="w-full rounded-3xl bg-gray-200 active:bg-gray-300 dark:bg-gray-700">
            <Text className="text-lg font-bold text-gray-700 dark:text-gray-200">Clear Cart</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
