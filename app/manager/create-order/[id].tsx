import { Text } from "@/components/ui/text";
import { $api } from "@/libs/api";
import { useDishTemplates } from "@/services/dishService";
import { useIngredientCategories } from "@/services/ingredientCategoryService";
import { useIngredients } from "@/services/ingredientService";
import { useCartStore } from "@/stores/cartStore";
import { useCustomizeStore } from "@/stores/customizeStore";
import { formatMoney } from "@/utils/currency";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function CreateOrderDishDetail() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const idParam = params.id;
  const router = useRouter();
  // Robustly parse id from route params (string or string[]), ignore invalid values
  const parsedId = useMemo(() => {
    const v = Array.isArray(idParam) ? idParam[0] : idParam;
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [idParam]);
  // Load single dish by id (no mock)
  const { data: dish, isLoading } = $api.useQuery("get", "/api/dish/{id}", {
    params: { path: { id: (parsedId as number) ?? 0 } },
    enabled: !!parsedId,
  });
  // Try to fetch recipe details for this dish (some backends return recipe with full ingredient objects)
  const { data: recipeRaw } = $api.useQuery("get", "/api/recipe/by-dish/{id}", {
    params: { path: { id: (parsedId as number) ?? 0 } },
    enabled: !!parsedId,
  });
  // Fallback: fetch all dishes and find by id if direct endpoint fails/unavailable
  const { data: dishesFallback } = $api.useQuery("get", "/api/dish", {
    enabled: !!parsedId,
  });
  const dishData: any = dish || (dishesFallback || []).find((d: any) => d?.id === parsedId);
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  // Inline customize panel state
  const [showCustomize, setShowCustomize] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedById, setSelectedById] = useState<Record<number, number>>({});

  // Load categories and ingredients for inline customize
  const { data: categoriesRaw } = useIngredientCategories();
  const { data: ingredientsRaw } = useIngredients();

  // Load dish templates for custom bowls (needed for basedOnId items)
  const { data: dishTemplatesRaw } = useDishTemplates();

  // Get default dish template for custom bowls (usually size M)
  const defaultDishTemplate = useMemo(() => {
    const templates = dishTemplatesRaw || [];
    // Look for size M first, fallback to first available
    const result = templates.find((t: any) => t?.size === "M") || templates[0] || null;

    // Debug log to check template loading
    if (__DEV__) {
      console.log("Dish templates loaded:", templates.length, "templates");
      console.log("Default template selected:", result);
    }

    return result;
  }, [dishTemplatesRaw]);

  // Normalize recipeRaw into ingredients array and a preset id set
  const safeExtractIngredients = (raw: any): any[] => {
    try {
      if (!raw) return [];
      if (Array.isArray(raw)) {
        const first = raw.find((r) => Array.isArray(r?.ingredients)) || raw[0];
        if (!first) return [];
        return first.ingredients || first.items || first.content || first.result || [];
      }
      return raw.ingredients || raw.items || raw.content || raw.result || [];
    } catch {
      return [];
    }
  };

  // Helper to handle different possible image fields from backend
  const getImageUrl = (obj: any) => {
    return (
      obj?.imageUrl ||
      obj?.image ||
      obj?.thumbnailUrl ||
      obj?.image_url ||
      obj?.photo ||
      obj?.avatarUrl ||
      null
    );
  };

  const recipeIngredients = useMemo(() => safeExtractIngredients(recipeRaw), [recipeRaw]);
  const presetIdsSet = useMemo(
    () =>
      new Set(
        (recipeIngredients || []).map((r: any) => r?.id ?? r?.ingredientId ?? r?.ingredient?.id)
      ),
    [recipeIngredients]
  );

  // Persist/load customize panel state per dish so selection survives navigation
  const { getForDish, setForDish, clearSelection } = useCustomizeStore();

  useEffect(() => {
    if (!parsedId) return;
    // Reset UI state immediately when switching dishes to avoid showing previous dish data
    setSelectedById({});
    setSelectedCategoryId(null);
    setShowCustomize(false);

    const cached = getForDish(Number(parsedId));
    if (cached) {
      setSelectedById(cached.selectedById || {});
      setSelectedCategoryId(cached.selectedCategoryId ?? null);
      setShowCustomize(Boolean(cached.showCustomize));
      return;
    }

    // No cached selection: prefill from recipe ingredients (presets default to 1 unit)
    if (recipeIngredients && recipeIngredients.length > 0) {
      const presetSel: Record<number, number> = {};
      for (const r of recipeIngredients) {
        const id = Number(r?.id ?? r?.ingredientId ?? r?.ingredient?.id);
        if (id && !Object.prototype.hasOwnProperty.call(presetSel, id)) {
          presetSel[id] = 1;
        }
      }
      if (Object.keys(presetSel).length > 0) {
        setSelectedById(presetSel);
      }
    }
  }, [parsedId, recipeIngredients, getForDish]);

  useEffect(() => {
    if (!parsedId) return;
    setForDish(Number(parsedId), { selectedById, selectedCategoryId, showCustomize });
  }, [parsedId, selectedById, selectedCategoryId, showCustomize, setForDish]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
      </SafeAreaView>
    );
  }

  if (!parsedId) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-lg">Invalid dish id</Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-[#FF6D00] px-4 py-2">
          <Text className="text-white">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!dishData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-lg">Dish not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-[#FF6D00] px-4 py-2">
          <Text className="text-white">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <Pressable onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-[#000000] dark:text-white">Dish detail</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Large Image */}
        <View className="items-center bg-white py-6 dark:bg-gray-900">
          {dishData?.imageUrl &&
          typeof dishData.imageUrl === "string" &&
          dishData.imageUrl.startsWith("http") ? (
            <Image
              source={{ uri: dishData.imageUrl }}
              style={{ width: 360, height: 260, borderRadius: 16 }}
              resizeMode="cover"
            />
          ) : (
            <View className="h-64 w-[360px] items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <MaterialIcons name="restaurant-menu" size={48} color="#FF6D00" />
            </View>
          )}
        </View>

        {/* Title & Description */}
        <View className="px-6 pb-20">
          <Text className="text-2xl font-bold text-[#000000] dark:text-white">{dishData.name}</Text>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-[#FF6D00]">
              {formatMoney(dishData.price || 0)}
            </Text>
          </View>

          {dishData.description ? (
            <Text className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {dishData.description}
            </Text>
          ) : null}

          {/* Ingredients (prefer recipe API ingredients, fallback to dish payload) */}
          {(() => {
            // Normalize recipeRaw into an ingredients array when possible
            const recipeIngredients: any[] | undefined = (() => {
              if (!recipeRaw) return undefined;
              // recipeRaw might be an array, an object with ingredients, or nested in items/content/result
              if (Array.isArray(recipeRaw)) {
                // If array of recipes, pick first that has ingredients
                const first = recipeRaw.find((r) => Array.isArray(r?.ingredients)) || recipeRaw[0];
                return first?.ingredients || first?.items || first?.content || first?.result || [];
              }
              // Cast to any to safely access potential properties from different backend formats
              const raw = recipeRaw as any;
              return raw?.ingredients || raw?.items || raw?.content || raw?.result || [];
            })();

            const ingredientsToShow: any[] =
              recipeIngredients && recipeIngredients.length > 0
                ? recipeIngredients
                : (dishData as any).ingredients || [];

            if (!ingredientsToShow || ingredientsToShow.length === 0) return null;

            return (
              <View className="mt-4">
                <Text className="text-base font-bold text-[#000000] dark:text-white">
                  Ingredients
                </Text>
                <ScrollView showsVerticalScrollIndicator={false} className="mt-3 max-h-[60vh]">
                  <View className="flex-col gap-3 px-6">
                    {ingredientsToShow.map((ing: any) => (
                      <View
                        key={ing?.id || ing?.ingredientId || Math.random()}
                        className="w-[120px] rounded-xl border border-gray-200 p-2">
                        {getImageUrl(ing) ? (
                          <Image
                            source={{ uri: getImageUrl(ing) as string }}
                            style={{ width: "100%", height: 80, borderRadius: 8 }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="h-20 w-full items-center justify-center rounded-lg bg-gray-200">
                            <Text className="text-xl font-bold text-gray-600">
                              {(ing?.name || "?").charAt(0)}
                            </Text>
                          </View>
                        )}
                        <Text className="mt-2 text-sm font-medium text-[#000000] dark:text-white">
                          {ing?.name || ing?.ingredientName || "Unknown"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            );
          })()}

          {/* Inline Customize button + panel */}
          <View className="mt-4">
            <Pressable
              onPress={() => setShowCustomize((s) => !s)}
              className="rounded-md border border-gray-200 px-4 py-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-medium text-[#000000] dark:text-white">Customize</Text>
                <MaterialIcons
                  name={showCustomize ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={20}
                  color="#000"
                />
              </View>
            </Pressable>

            {showCustomize ? (
              <View className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
                {/* Categories horizontal */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                  <View className="flex-row gap-2">
                    {(categoriesRaw || []).map((cat: any) => (
                      <Pressable
                        key={cat.id}
                        onPress={() => setSelectedCategoryId(cat.id)}
                        className={`rounded-full px-3 py-2 ${selectedCategoryId === cat.id ? "bg-[#FF6D00]" : "bg-gray-100"}`}>
                        <Text
                          className={`${selectedCategoryId === cat.id ? "text-white" : "text-gray-700"}`}>
                          {cat.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                {/* Ingredients list for selected category */}
                <ScrollView showsVerticalScrollIndicator={false} className="max-h-[60vh]">
                  <View className="flex-col gap-3">
                    {((ingredientsRaw || []) as any[])
                      .filter((ing: any) => {
                        if (!selectedCategoryId) return true;
                        // ingredient.category might be object or id
                        const catId = ing?.category?.id ?? ing?.category;
                        return Number(catId) === Number(selectedCategoryId);
                      })
                      .map((ingredient: any) => {
                        const id = Number(ingredient.id);
                        // Preserve existing logic: explicit selection wins, otherwise preset defaults to 1 portion
                        const hasExplicit = Object.prototype.hasOwnProperty.call(selectedById, id);
                        const explicitVal = hasExplicit ? selectedById[id] : undefined;
                        const unit =
                          explicitVal !== undefined ? explicitVal : presetIdsSet.has(id) ? 1 : 0;
                        const isPreset = presetIdsSet.has(id);
                        const faded = unit === 0;

                        // UI-only: render as a single-row item with image, name and compact controls on the right.
                        return (
                          <View
                            key={id}
                            className={`w-full flex-row items-center justify-between rounded-xl bg-white p-3 ${faded ? "opacity-50" : ""} ${isPreset ? "border border-[#FF6D00]" : "border border-gray-200"}`}>
                            <View className="flex-row items-center" style={{ flex: 1 }}>
                              {getImageUrl(ingredient) ? (
                                <Image
                                  source={{ uri: getImageUrl(ingredient) as string }}
                                  style={{ width: 40, height: 40, borderRadius: 20 }}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                  <Text className="text-lg font-bold text-gray-600">
                                    {(ingredient?.name || "?").charAt(0)}
                                  </Text>
                                </View>
                              )}

                              <View className="ml-3" style={{ flexShrink: 1 }}>
                                <Text
                                  className={`text-sm font-medium ${isPreset ? "text-[#FF6D00]" : "text-[#000000] dark:text-white"}`}
                                  numberOfLines={1}>
                                  {ingredient.name}
                                </Text>
                                <Text className="text-xs text-gray-500">{unit * 100}g</Text>
                              </View>
                            </View>

                            <View className="ml-4 flex-row items-center">
                              <Pressable
                                onPress={() =>
                                  setSelectedById((s) => {
                                    const curr = Object.prototype.hasOwnProperty.call(s, id)
                                      ? s[id]
                                      : presetIdsSet.has(id)
                                        ? 1
                                        : 0;
                                    const next = Math.max(0, curr - 1);
                                    return { ...s, [id]: next };
                                  })
                                }
                                className="mr-2 h-8 w-8 items-center justify-center rounded-full border border-gray-300">
                                <MaterialIcons name="remove" size={18} color="#000" />
                              </Pressable>

                              <Text className="w-8 text-center">{unit}</Text>

                              <Pressable
                                onPress={() =>
                                  setSelectedById((s) => {
                                    const curr = Object.prototype.hasOwnProperty.call(s, id)
                                      ? s[id]
                                      : presetIdsSet.has(id)
                                        ? 1
                                        : 1; // Will become 2 after increment (200g default per BE requirement)
                                    return { ...s, [id]: curr + 1 };
                                  })
                                }
                                className="ml-2 h-8 w-8 items-center justify-center rounded-full border border-gray-300">
                                <MaterialIcons name="add" size={18} color="#000" />
                              </Pressable>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                </ScrollView>

                {/* panel-level Add button removed — main Add to cart handles custom flow */}
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar (like Customize) */}
      <View className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm text-gray-600 dark:text-gray-400">Qty • {qty}</Text>
          <Text className="text-2xl font-bold text-[#FF6D00]">
            {formatMoney((dishData.price || 0) * qty)}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Quantity */}
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => setQty(Math.max(1, qty - 1))}
              className="h-10 w-10 items-center justify-center rounded-full border border-gray-300">
              <MaterialIcons name="remove" size={20} color="#000000" />
            </Pressable>
            <Text className="w-8 text-center text-lg font-bold text-[#000000] dark:text-white">
              {qty}
            </Text>
            <Pressable
              onPress={() => setQty(qty + 1)}
              className="h-10 w-10 items-center justify-center rounded-full border border-gray-300">
              <MaterialIcons name="add" size={20} color="#000000" />
            </Pressable>
          </View>

          {/* Add to Cart */}
          <Pressable
            onPress={() => {
              try {
                // If customize panel is open, and selections exist -> add custom item
                if (showCustomize) {
                  // Items explicitly added (>0 units)
                  const added = Object.entries(selectedById)
                    .map(([k, v]) => ({
                      ingredientId: Number(k),
                      quantity: (v || 0) * 100,
                      sourceType: "ADDON" as const,
                    }))
                    .filter((r) => r.quantity > 0);

                  // For preset ingredients that the user explicitly set to 0, include them as REMOVED
                  const removed: any[] = [];
                  for (const rawPid of Array.from(presetIdsSet)) {
                    const pid = Number(rawPid);
                    if (
                      Object.prototype.hasOwnProperty.call(selectedById, pid) &&
                      selectedById[pid] === 0
                    ) {
                      removed.push({
                        ingredientId: pid,
                        quantity: 0,
                        sourceType: "REMOVED" as const,
                      });
                    }
                  }

                  const recipeItems = [...added, ...removed];

                  if (recipeItems.length === 0) {
                    Toast.show({ type: "info", text1: "Please add at least one ingredient" });
                    return;
                  }

                  // Calculate price for basedOnId: base dish price + added ingredients cost
                  // As per BE requirement: "baseonid dish = original dish + amount of ingredients it adds"
                  let basePrice = dishData.price || 0;
                  let addedIngredientsCost = 0;
                  added.forEach((item) => {
                    const ing = ingredientsRaw?.find((i: any) => i.id === item.ingredientId);
                    if (ing) {
                      // For GRAM unit, pricePerUnit is per 1g, so multiply by quantity (200g default)
                      // For other units (KILOGRAM, LITER, PCS), pricePerUnit is already correct
                      const priceMultiplier = ing.unit === "GRAM" ? item.quantity : 1;
                      addedIngredientsCost += (ing.pricePerUnit || 0) * priceMultiplier;
                    }
                  });
                  const totalPrice = basePrice + addedIngredientsCost;

                  // Debug: Check what data we're sending to cart
                  console.log("🔍 [DishDetail] Adding custom item to cart:", {
                    dishId: dishData.id,
                    name: dishData.name,
                    basePrice,
                    addedIngredientsCost,
                    totalPrice,
                    imageUrl: dishData.imageUrl,
                    recipeItemsCount: recipeItems.length,
                  });

                  addItem({
                    dishId: Number(dishData.id ?? 0),
                    name: `${dishData.name} (custom)`,
                    price: totalPrice,
                    quantity: 1,
                    imageUrl: dishData.imageUrl || null,
                    recipe: recipeItems,
                    basedOnId: Number(dishData.id ?? 0),
                    // Include dish template for backend compatibility
                    dishTemplate: defaultDishTemplate || {
                      size: "M",
                      name: "Tô lớn",
                      priceRatio: 1.5,
                      quantityRatio: 1.5,
                      max_Carb: 1,
                      max_Protein: 3,
                      max_Vegetable: 4,
                    },
                  });
                  Toast.show({ type: "success", text1: "Added custom bowl to cart" });
                  // Clear cached selection so next dish starts fresh
                  clearSelection(Number(dishData.id ?? 0));
                  setSelectedById({});
                  setShowCustomize(false);
                  // 🔄 CHANGED: Navigate to manager cart instead of (tabs)
                  router.push("/manager/create-order/cart");
                  return;
                }

                // Default preset add
                addItem({
                  dishId: Number(dishData.id ?? 0),
                  name: dishData.name || "Dish",
                  price: dishData.price || 0,
                  quantity: qty,
                  imageUrl: dishData.imageUrl || null,
                });
                Toast.show({ type: "success", text1: "Added to cart" });
                // clear any lingering customize cache for this dish
                clearSelection(Number(dishData.id ?? 0));
                setSelectedById({});
                // 🔄 CHANGED: Navigate to manager cart instead of (tabs)
                router.push("/manager/create-order/cart");
              } catch {
                Toast.show({ type: "error", text1: "Add to cart failed" });
              }
            }}
            className="flex-1 rounded-full bg-[#FF6D00] py-3 active:bg-[#FF4D00]">
            <View className="flex-row items-center justify-center">
              <MaterialIcons name="shopping-cart" size={20} color="white" />
              <Text className="ml-2 font-bold text-white">Add to cart</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
