import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { useIngredients } from "@/services/ingredientService";
import { transformCartToMakeOrderRequest, useCreateOrder } from "@/services/orderService";
import { useCartStore } from "@/stores/cartStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type PaymentMethod = "CASH" | "MOMO" | "VNPAY";

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, clear, getTotal } = useCartStore();
  const createOrder = useCreateOrder();

  const [selectingPayment, setSelectingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>("CASH");
  const [note, setNote] = useState<string | undefined>(undefined);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [uiSubmitting, setUiSubmitting] = useState(false); // visual pending to ensure UX feedback

  const subtotal = useMemo(() => getTotal(), [items, getTotal]);
  const isEmpty = items.length === 0;

  const increase = (id: string, qty: number) => updateQuantity(id, qty + 1);
  const decrease = (id: string, qty: number) => updateQuantity(id, Math.max(1, qty - 1));

  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  // Load ingredients to resolve names for recipe display
  const { data: ingredientsRaw } = useIngredients();
  const ingNameById = useMemo(() => {
    const map = new Map<number, string>();
    (ingredientsRaw || []).forEach((i: any) => map.set(i.id, i.name));
    return map;
  }, [ingredientsRaw]);

  const toggleExpanded = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const placeOrder = async () => {
    if (!user?.userId) {
      Toast.show({ type: "error", text1: "Not logged in" });
      return;
    }
    if (isEmpty) {
      Toast.show({ type: "info", text1: "Your cart is empty" });
      return;
    }
    if (!paymentMethod) {
      Toast.show({ type: "info", text1: "Select payment method" });
      return;
    }

    try {
      setUiSubmitting(true);
      const payload = transformCartToMakeOrderRequest({
        accountId: user.userId,
        paymentMethod,
        note,
        items,
      });

      // Optional: debug payload in development
      try {
        if (__DEV__) {
          console.log("POST /api/order payload", JSON.stringify(payload));
        }
      } catch {}

      await createOrder.mutateAsync({ body: payload });

      Toast.show({ type: "success", text1: "Order placed" });
      clear();
      router.replace("/(tabs)/order");
    } catch (e: any) {
      console.error("Place order failed", e);
      const message = e?.message || e?.data?.message || "Failed to place order";
      Toast.show({ type: "error", text1: message });
    } finally {
      // ensure the overlay is visible briefly even on super-fast responses
      setTimeout(() => setUiSubmitting(false), 400);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <Pressable onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-[#000000] dark:text-white">My Cart</Text>
      </View>

      {/* Body */}
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-6">
        {/* Order Summary */}
        <Text className="mb-3 text-base font-semibold text-[#000000] dark:text-white">
          Order Summary
        </Text>

        {isEmpty ? (
          <View className="items-center justify-center py-16">
            <MaterialIcons name="shopping-cart" size={64} color="#E5E7EB" />
            <Text className="mt-3 text-sm text-gray-500">Your cart is empty</Text>
          </View>
        ) : (
          <View className="gap-3">
            {items.map((item) => (
              <View
                key={item.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
                <View className="flex-row p-3">
                  <View className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: 64, height: 64 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-16 w-16 items-center justify-center">
                        <MaterialIcons name="restaurant-menu" size={28} color="#FF6D00" />
                      </View>
                    )}
                  </View>

                  <View className="ml-3 flex-1">
                    <View className="mb-1 flex-row items-start justify-between">
                      <Text className="flex-1 pr-2 font-semibold text-[#000000] dark:text-white">
                        {item.name}
                      </Text>
                      <View className="items-end">
                        <Text className="text-base font-bold text-[#FF6D00]">
                          {formatMoney(item.price)}
                        </Text>
                      </View>
                    </View>

                    {/* Quantity controls */}
                    <View className="mt-1 flex-row items-center gap-3">
                      <Pressable
                        onPress={() => decrease(item.id, item.quantity)}
                        className="h-8 w-8 items-center justify-center rounded-full border border-gray-300">
                        <MaterialIcons name="remove" size={18} color="#000000" />
                      </Pressable>
                      <Text className="w-8 text-center text-base font-bold text-[#000000] dark:text-white">
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => increase(item.id, item.quantity)}
                        className="h-8 w-8 items-center justify-center rounded-full border border-gray-300">
                        <MaterialIcons name="add" size={18} color="#000000" />
                      </Pressable>

                      <Pressable onPress={() => removeItem(item.id)} className="ml-auto p-1">
                        <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                      </Pressable>
                    </View>

                    {/* Recipe details */}
                    {item.recipe && item.recipe.length > 0 && (
                      <View className="mt-2">
                        {/* Inline toggle row beside ingredients area */}
                        <Pressable
                          onPress={() => toggleExpanded(item.id)}
                          className="flex-row items-center">
                          <MaterialIcons
                            name={expanded[item.id] ? "expand-less" : "expand-more"}
                            size={18}
                            color="#9CA3AF"
                          />
                          <Text className="ml-1 text-xs text-gray-500">
                            {expanded[item.id] ? "Hide ingredients" : "View ingredients"}
                          </Text>
                        </Pressable>

                        {expanded[item.id] && (
                          <View className="mt-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                            {item.recipe.map((r, idx) => (
                              <View key={idx} className="mb-1 flex-row items-center">
                                <View className="mr-2 h-1.5 w-1.5 rounded-full bg-[#FF6D00]" />
                                <Text className="text-xs text-gray-700 dark:text-gray-300">
                                  {ingNameById.get(r.ingredientId || 0) || `#${r.ingredientId}`}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Payment method selector */}
        <View className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <Pressable
            disabled={isEmpty}
            onPress={() => setSelectingPayment(true)}
            className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="credit-card" size={20} color="#FF6D00" />
              <View>
                <Text className="text-sm font-semibold text-[#000000] dark:text-white">
                  Payment method
                </Text>
                <Text className="text-xs text-gray-500">
                  {paymentMethod ? paymentMethod : "Select Payment Method"}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Totals */}
        <View className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm text-gray-600 dark:text-gray-300">Subtotal</Text>
            <Text className="text-base font-semibold text-[#000000] dark:text-white">
              {formatMoney(subtotal)}
            </Text>
          </View>
          <View className="h-px w-full bg-gray-200 dark:bg-gray-700" />
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-sm text-gray-600 dark:text-gray-300">Total</Text>
            <Text className="text-xl font-bold text-[#FF6D00]">{formatMoney(subtotal)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pending overlay */}
      {(uiSubmitting || createOrder.isPending) && (
        <View className="pointer-events-none absolute inset-0 items-center justify-center bg-black/20">
          <View className="rounded-2xl bg-white px-4 py-3 shadow-md dark:bg-gray-800">
            <View className="flex-row items-center gap-3">
              <ActivityIndicator color="#FF6D00" />
              <Text className="text-sm text-[#000000] dark:text-white">Submitting order...</Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Bar */}
      <View className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-[#FF6D00]">{formatMoney(subtotal)}</Text>
          <Pressable
            disabled={isEmpty || createOrder.isPending || uiSubmitting}
            onPress={placeOrder}
            className={`rounded-full px-6 py-3 ${
              isEmpty || createOrder.isPending || uiSubmitting
                ? "bg-gray-300"
                : "bg-[#FF6D00] active:bg-[#FF4D00]"
            }`}>
            {createOrder.isPending || uiSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-bold text-white">Place Order</Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Simple Payment Sheet */}
      {selectingPayment && (
        <View className="absolute inset-0 bg-black/40">
          <Pressable className="flex-1" onPress={() => setSelectingPayment(false)} />
          <View className="rounded-t-2xl bg-white p-4 dark:bg-gray-900">
            <Text className="mb-2 text-center text-base font-semibold text-[#000000] dark:text-white">
              Select Payment Method
            </Text>
            {(["CASH", "MOMO", "VNPAY"] as PaymentMethod[]).map((method) => (
              <Pressable
                key={method}
                onPress={() => {
                  setPaymentMethod(method);
                  setSelectingPayment(false);
                }}
                className={`mb-2 flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                  paymentMethod === method
                    ? "border-[#FF6D00] bg-[#FF6D00]/10"
                    : "border-gray-200 dark:border-gray-700"
                }`}>
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="payments" size={20} color="#FF6D00" />
                  <Text className="text-base text-[#000000] dark:text-white">{method}</Text>
                </View>
                <MaterialIcons
                  name={
                    paymentMethod === method ? "radio-button-checked" : "radio-button-unchecked"
                  }
                  size={22}
                  color={paymentMethod === method ? "#FF6D00" : "#9CA3AF"}
                />
              </Pressable>
            ))}
            <View className="h-4" />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
