import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { $api } from "@/libs/api";
import { useDishTemplates } from "@/services/dishService";
import { useIngredients } from "@/services/ingredientService";
import { transformCartToMakeOrderRequest, useCreateOrder } from "@/services/orderService";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/utils/currency";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type PaymentMethod = "MOMO" | "VNPAY";

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, updateItemNote, clear, getTotal, fixMissingDishTemplates } =
    useCartStore();
  const createOrder = useCreateOrder();

  // Load dish templates to fix any missing ones in cart items
  const { data: dishTemplatesRaw } = useDishTemplates();

  // Fix any cart items with basedOnId but missing dishTemplate
  useEffect(() => {
    if (dishTemplatesRaw && dishTemplatesRaw.length > 0) {
      const defaultTemplate =
        dishTemplatesRaw.find((t: any) => t?.size === "M") || dishTemplatesRaw[0];
      if (defaultTemplate) {
        fixMissingDishTemplates(defaultTemplate);
      }
    }
  }, [dishTemplatesRaw, fixMissingDishTemplates]);

  const [selectingPayment, setSelectingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>("MOMO");
  const [note, setNote] = useState<string | undefined>(undefined);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingNoteFor, setEditingNoteFor] = useState<string | null>(null);
  const [uiSubmitting, setUiSubmitting] = useState(false); // visual pending to ensure UX feedback
  const [pollingOrderId, setPollingOrderId] = useState<number | null>(null);
  const [errorState, setErrorState] = useState<{
    show: boolean;
    title: string;
    message: string;
    rawResponse?: string;
    canRetry: boolean;
  }>({
    show: false,
    title: "",
    message: "",
    canRetry: false,
  });

  // Recalculate subtotal whenever items change (fix for price not updating bug)
  const subtotal = useMemo(() => getTotal(), [items, getTotal]);
  const isEmpty = items.length === 0;

  const increase = (id: string, qty: number) => updateQuantity(id, qty + 1);
  const decrease = (id: string, qty: number) => updateQuantity(id, Math.max(1, qty - 1));

  // Load ingredients to resolve names for recipe display
  const { data: ingredientsRaw } = useIngredients();
  const ingNameById = useMemo(() => {
    const map = new Map<number, string>();
    (ingredientsRaw || []).forEach((i: any) => map.set(i.id, i.name));
    return map;
  }, [ingredientsRaw]);

  const toggleExpanded = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  // Navigate to dish detail page when user clicks on a cart item to review/edit
  const handleItemClick = (item: typeof items[0]) => {
    // For custom dishes (has recipe), navigate to customize page
    if (item.recipe && item.recipe.length > 0) {
      // If it's based on a dish, go to that dish detail to customize
      if (item.basedOnId && item.basedOnId > 0) {
        router.push(`/(tabs)/menu/${item.basedOnId}`);
      } else {
        // Fully custom dish, go to customize page
        router.push(`/(tabs)/menu/customize`);
      }
    } else if (item.dishId && item.dishId > 0) {
      // Navigate to dish detail page for preset dishes
      router.push(`/(tabs)/menu/${item.dishId}`);
    }
  };

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

      // Debug cart items before transformation
      if (__DEV__) {
        console.log("Cart items before transformation:", JSON.stringify(items, null, 2));
      }

      const payload = transformCartToMakeOrderRequest({
        accountId: user.userId,
        paymentMethod,
        note,
        items,
      });

      // Optional: debug payload in development
      try {
        if (__DEV__) {
          console.log("POST /api/order payload", JSON.stringify(payload, null, 2));
        }
      } catch {}

      const resp = await createOrder.mutateAsync({ body: payload });

      // Debug: log createOrder response in development
      try {
        if (__DEV__) console.log("createOrder response:", resp);
      } catch {}

      // If payment method requires external flow (MOMO/VNPAY), backend may return a redirect URL
      if (
        paymentMethod &&
        typeof resp === "string" &&
        resp.startsWith("http")
      ) {
        // Open external payment page (will return via callback to backend)
        try {
          await Linking.openURL(resp);
        } catch (err) {
          console.error("Failed to open payment url", err);
          Toast.show({ type: "info", text1: "Order created. Open payment URL failed." });
        }
        // Order is created; keep cart cleared to avoid duplicates
        clear();
        router.replace("/(tabs)/order");
      } else if (resp && typeof resp === "object" && (resp as any).orderId) {
        // Backend returned an order object / orderId — show polling modal until payment is completed
        const oid = Number((resp as any).orderId);
        if (oid) {
          setPollingOrderId(oid);
          // Do not clear cart yet; we'll clear when status becomes PAID/COMPLETED in the polling effect
        } else {
          Toast.show({ type: "success", text1: "Order placed" });
          clear();
          router.replace("/(tabs)/order");
        }
      } else {
        // Cash or no useful redirect URL provided
        Toast.show({ type: "success", text1: "Order placed" });
        clear();
        router.replace("/(tabs)/order");
      }
    } catch (e: any) {
      console.error("Place order failed", e);

      // Enhanced error handling for JSON parse errors and backend debugging
      let errorTitle = "Order Failed";
      let errorMessage = "Failed to place order";
      let rawResponse = "";
      let canRetry = true;

      if (
        e?.message?.includes("JSON Parse error") ||
        e?.message?.includes("Unexpected character")
      ) {
        errorTitle = "Backend Response Error";
        errorMessage = "Server returned invalid response format";
        rawResponse = e?.response || e?.data || e?.message || "";
        canRetry = true;
      } else if (e?.message?.includes("Network")) {
        errorTitle = "Network Error";
        errorMessage = "Check your internet connection";
        canRetry = true;
      } else if (e?.response?.status === 400) {
        errorTitle = "Invalid Order";
        errorMessage = e?.response?.data?.message || "Order data is invalid";
        canRetry = false;
      } else if (e?.response?.status === 401) {
        errorTitle = "Authentication Error";
        errorMessage = "Please log in again";
        canRetry = false;
      } else {
        errorMessage = e?.message || e?.data?.message || "Unknown error occurred";
      }

      // Show detailed error modal instead of simple toast
      setErrorState({
        show: true,
        title: errorTitle,
        message: errorMessage,
        rawResponse: rawResponse ? rawResponse.substring(0, 200) : undefined,
        canRetry,
      });

      // Also log for backend team debugging
      if (__DEV__) {
        console.log("Raw error object:", e);
        if (rawResponse) {
          console.log("Raw response excerpt:", rawResponse.substring(0, 500));
        }
      }
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
                  {/* Clickable dish image and name section */}
                  <Pressable
                    onPress={() => handleItemClick(item)}
                    className="flex-row flex-1">
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
                      {/* Hint text to indicate clickability */}
                      <Text className="text-xs text-gray-500">
                        {item.recipe && item.recipe.length > 0 ? "Tap to customize again" : "Tap to view details"}
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* Quantity controls and other buttons */}
                <View className="px-3 pb-3">
                  <View className="flex-row items-center gap-3">
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
                          {item.recipe.map((r, idx) => {
                            const name =
                              ingNameById.get(r.ingredientId || 0) || `#${r.ingredientId}`;
                            const isRemoved =
                              (r.sourceType || "") === "REMOVED" ||
                              (r.quantity === 0 && (r.sourceType || "") === "REMOVED");
                            const qtyText = isRemoved
                              ? "-1 phần"
                              : r.quantity
                                ? `${r.quantity / 100} phần (${r.quantity}g)`
                                : "";

                            return (
                              <View
                                key={idx}
                                className="mb-1 flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                  <View className="mr-2 h-1.5 w-1.5 rounded-full bg-[#FF6D00]" />
                                  <Text className="text-xs text-gray-700 dark:text-gray-300">
                                    {name}
                                  </Text>
                                </View>
                                <Text className="text-xs text-gray-500">{qtyText}</Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  )}

                  {/* Item Note */}
                  <View className="mt-2">
                    {editingNoteFor === item.id ? (
                      <View className="rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
                        <TextInput
                          value={item.note || ""}
                          onChangeText={(text) => updateItemNote(item.id, text)}
                          placeholder="Ghi chú cho món này..."
                          placeholderTextColor="#9CA3AF"
                          multiline
                          numberOfLines={2}
                          className="text-xs text-[#000000] dark:text-white"
                          style={{ minHeight: 40, textAlignVertical: 'top' }}
                        />
                        <Pressable
                          onPress={() => setEditingNoteFor(null)}
                          className="mt-1 self-end">
                          <Text className="text-xs font-semibold text-[#FF6D00]">Xong</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => setEditingNoteFor(item.id)}
                        className="flex-row items-center">
                        <MaterialIcons name="note-add" size={16} color="#9CA3AF" />
                        <Text className="ml-1 text-xs text-gray-500">
                          {item.note ? `Ghi chú: ${item.note}` : "Thêm ghi chú cho món này"}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Order Note */}
        <View className="mt-6">
          <Text className="mb-2 text-sm font-semibold text-[#000000] dark:text-white">
            Ghi chú đơn hàng (tuỳ chọn)
          </Text>
          <View className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <TextInput
              value={note || ""}
              onChangeText={setNote}
              placeholder="Ví dụ: Giao hàng trước 7 giờ tối..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              className="px-4 py-3 text-sm text-[#000000] dark:text-white"
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>
        </View>

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

      {/* Polling overlay when backend returns orderId */}
      {pollingOrderId && (
        <OrderPollingModal
          orderId={pollingOrderId}
          onFinalized={() => {
            // Clear cart and navigate when order is finalized
            clear();
            setPollingOrderId(null);
            router.replace("/(tabs)/order");
          }}
          onCancel={() => setPollingOrderId(null)}
        />
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

      {/* Error Modal */}
      {errorState.show && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <View className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-800">
            <View className="mb-4 items-center">
              <MaterialIcons name="error-outline" size={48} color="#EF4444" />
              <Text className="mt-2 text-center text-lg font-bold text-[#000000] dark:text-white">
                {errorState.title}
              </Text>
            </View>

            <Text className="mb-4 text-center text-sm text-gray-600 dark:text-gray-300">
              {errorState.message}
            </Text>

            {/* Show raw response excerpt for backend debugging */}
            {errorState.rawResponse && (
              <View className="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
                <Text className="mb-1 text-xs font-semibold text-gray-500">
                  Raw Response (for debugging):
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  {errorState.rawResponse}...
                </Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setErrorState({ ...errorState, show: false })}
                className="flex-1 rounded-xl border border-gray-300 py-3">
                <Text className="text-center text-base font-semibold text-gray-700">Close</Text>
              </Pressable>

              {errorState.canRetry && (
                <Pressable
                  onPress={() => {
                    setErrorState({ ...errorState, show: false });
                    // Retry the order placement
                    setTimeout(() => placeOrder(), 100);
                  }}
                  className="flex-1 rounded-xl bg-[#FF6D00] py-3 active:bg-[#FF4D00]">
                  <Text className="text-center text-base font-semibold text-white">Retry</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Simple Payment Sheet */}
      {selectingPayment && (
        <View className="absolute inset-0 bg-black/40">
          <Pressable className="flex-1" onPress={() => setSelectingPayment(false)} />
          <View className="rounded-t-2xl bg-white p-4 dark:bg-gray-900">
            <Text className="mb-2 text-center text-base font-semibold text-[#000000] dark:text-white">
              Select Payment Method
            </Text>
            {(["MOMO", "VNPAY"] as PaymentMethod[]).map((method) => (
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

// Small modal component that polls order status via $api every 3s until final state
function OrderPollingModal({
  orderId,
  onFinalized,
  onCancel,
}: {
  orderId: number;
  onFinalized: () => void;
  onCancel: () => void;
}) {
  const { data, isFetching, refetch } = $api.useQuery("get", "/api/order/{id}", {
    params: { path: { id: orderId } },
    // Poll every 3 seconds
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (!data) return;
    const status = (data as any)?.status;
    if (status === "PAID" || status === "COMPLETED") {
      Toast.show({ type: "success", text1: "Payment completed" });
      onFinalized();
    }
  }, [data, onFinalized]);

  return (
    <View className="absolute inset-0 items-center justify-center bg-black/30">
      <View className="w-[320px] rounded-xl bg-white p-4">
        <Text className="text-base font-semibold text-[#000]">Processing payment</Text>
        <Text className="mt-2 text-sm text-gray-600">
          Order #{orderId} — waiting for payment confirmation...
        </Text>
        <View className="mt-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => {
              onCancel();
            }}
            className="rounded-lg border px-4 py-2">
            <Text>Cancel</Text>
          </Pressable>
          <Pressable onPress={() => refetch()} className="rounded-lg bg-[#FF6D00] px-4 py-2">
            <Text className="text-white">Refresh</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
