import { NutritionCalculator } from "@/components/nutrition/NutritionCalculator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Text } from "@/components/ui/text";
import { $api, fetchClient } from "@/libs/api";
import { useDishTemplates } from "@/services/dishService";
import { useIngredientCategories } from "@/services/ingredientCategoryService";
import { useIngredients } from "@/services/ingredientService";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/utils/currency";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type RecipeItem = {
  ingredientId: number;
  quantity: number;
  sourceType: "BASE" | "ADDON" | "REMOVED";
};

export default function CustomizeDefaultBowl() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  // Parse dish ID from params
  const dishId = useMemo(() => {
    const v = Array.isArray(params.id) ? params.id[0] : params.id;
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [params.id]);

  // Fetch the base dish
  const { data: dish, isLoading: loadingDish } = $api.useQuery("get", "/api/dish/{id}", {
    params: { path: { id: (dishId as number) ?? 0 } },
    enabled: !!dishId,
  });

  // Fetch recipe for the dish
  const { data: recipeRaw, isLoading: loadingRecipe } = $api.useQuery(
    "get",
    "/api/recipe/by-dish/{id}",
    {
      params: { path: { id: (dishId as number) ?? 0 } },
      enabled: !!dishId,
    }
  );

  // Fetch dish templates, categories, and ingredients
  const { data: templatesRaw, isLoading: loadingTemplates } = useDishTemplates();
  const { data: categoriesRaw, isLoading: loadingCategories } = useIngredientCategories();
  const { data: ingredientsRaw, isLoading: loadingIngredients } = useIngredients();

  const isLoading =
    loadingDish || loadingRecipe || loadingTemplates || loadingCategories || loadingIngredients;

  // Selected template (size: S, M, L)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Selected ingredients {categoryId: RecipeItem[]}
  const [selectedByCategory, setSelectedByCategory] = useState<{ [key: number]: RecipeItem[] }>({});

  // Store nutrition data for ingredients: {ingredientId: Nutrition}
  const [nutritionData, setNutritionData] = useState<{ [key: number]: any }>({});

  const [quantity, setQuantity] = useState(1);
  const [isBaseOpen, setIsBaseOpen] = useState(false);
  const [isAddedOpen, setIsAddedOpen] = useState(true);

  // Normalize size helper
  const normalizeSize = (s?: string) => (s ? String(s).trim().toUpperCase() : "");

  // Sort templates: S, M, L
  const templates = useMemo(() => {
    if (!templatesRaw) return [];
    return [...templatesRaw].sort((a, b) => {
      const order: { [key: string]: number } = { S: 1, M: 2, L: 3 };
      return (order[normalizeSize(a.size)] || 99) - (order[normalizeSize(b.size)] || 99);
    });
  }, [templatesRaw]);

  // Auto-select default size (M)
  useEffect(() => {
    if (!selectedTemplate && templates.length > 0) {
      const preferred = templates.find((t: any) => normalizeSize(t.size) === "M") || templates[0];
      setSelectedTemplate(preferred);
    }
  }, [templates, selectedTemplate]);

  // Filter unique categories
  const categories = useMemo(() => {
    if (!categoriesRaw) return [];
    const seen = new Set<string>();
    return categoriesRaw.filter((cat: any) => {
      const name = (cat.name || "").toLowerCase().trim();
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [categoriesRaw]);

  // Get ingredients for a category
  const getIngredientsByCategory = (categoryId: number) => {
    return (
      ingredientsRaw?.filter(
        (ing: any) => ing?.category?.id === categoryId && ing?.active !== false
      ) || []
    );
  };

  // Extract base recipe from API response
  const baseRecipe = useMemo(() => {
    if (!recipeRaw) return [];
    try {
      if (Array.isArray(recipeRaw)) {
        const first = recipeRaw.find((r) => Array.isArray(r?.ingredients)) || recipeRaw[0];
        return first?.ingredients || [];
      }
      const raw = recipeRaw as any;
      return raw?.ingredients || raw?.items || raw?.content || raw?.result || [];
    } catch {
      return [];
    }
  }, [recipeRaw]);

  // Pre-fill selected ingredients from base recipe
  useEffect(() => {
    if (!baseRecipe || baseRecipe.length === 0) return;
    if (Object.keys(selectedByCategory).length > 0) return; // Already initialized

    const categoryMap: { [key: number]: RecipeItem[] } = {};

    baseRecipe.forEach((ing: any) => {
      const ingredientId = ing?.id || ing?.ingredientId || ing?.ingredient?.id;
      const categoryId = ing?.category?.id || ing?.ingredient?.category?.id;
      const quantity = ing?.neededQuantity || ing?.quantity || 200; // Default 200g

      if (ingredientId && categoryId) {
        if (!categoryMap[categoryId]) categoryMap[categoryId] = [];
        categoryMap[categoryId].push({
          ingredientId,
          quantity,
          sourceType: "BASE",
        });
      }
    });

    setSelectedByCategory(categoryMap);
  }, [baseRecipe, selectedByCategory]);

  // Convert unit to short form
  const getShortUnit = (unit?: string): string => {
    if (!unit) return "g";
    const normalized = unit.toUpperCase();
    switch (normalized) {
      case "GRAM":
        return "g";
      case "KILOGRAM":
        return "kg";
      case "LITER":
        return "l";
      case "MILLILITER":
        return "ml";
      case "PCS":
      case "PIECE":
      case "PIECES":
        return "pcs";
      default:
        return unit.toLowerCase();
    }
  };

  // Category role detection (same logic as customize.tsx)
  type Role = "CARB" | "PROTEIN" | "VEGETABLE" | "OTHER";
  const normalizeVN = (s?: string) =>
    (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const detectCategoryRole = (name?: string): Role => {
    const n = normalizeVN(name);
    const has = (arr: string[]) => arr.some((k) => n === k || n.includes(k));
    // Exact mapping
    if (has(["tinh bot"])) return "CARB";
    if (has(["thit", "hai san"])) return "PROTEIN";
    if (has(["rau tuoi", "rau va co", "trai cay", "hat & dau", "nam"])) return "VEGETABLE";
    if (has(["sot", "nuoc"])) return "OTHER";
    // Fallback heuristics
    if (/\b(protein|ga|bo|heo|ca|tom)\b/.test(n)) return "PROTEIN";
    if (/\b(com|gao|rice|quinoa|bun|mi)\b/.test(n)) return "CARB";
    return "VEGETABLE";
  };

  // Get max allowed parts from DishTemplate
  const maxForRole = (role: Role) => {
    if (!selectedTemplate) return Infinity;
    // Use max values from DishTemplate
    if (role === "CARB") return selectedTemplate.max_Carb ?? 1;
    if (role === "PROTEIN") return selectedTemplate.max_Protein ?? 3;
    if (role === "VEGETABLE") return selectedTemplate.max_Vegetable ?? 4;
    return Infinity;
  };

  // Calculate total parts for a role (200g = 1 part for GRAM ingredients)
  const calculatePartsForRole = (role: Role): number => {
    return categories.reduce((acc: number, c: any) => {
      if (detectCategoryRole(c?.name) !== role) return acc;
      const items = selectedByCategory[c.id!] || [];
      return (
        acc +
        items.reduce((sum, item) => {
          const ing = ingredientsRaw?.find((i: any) => i.id === item.ingredientId);
          if (!ing) return sum;
          // For GRAM: 200g = 1 part, 400g = 2 parts, etc.
          // For others: each item = 1 part
          const parts = ing.unit?.toUpperCase() === "GRAM" ? item.quantity / 200 : 1;
          return sum + parts;
        }, 0)
      );
    }, 0);
  };

  // Fetch nutrition data for an ingredient
  const fetchNutritionForIngredient = async (ingredientId: number) => {
    console.log("🔍 [NUTRITION] Fetching nutrition for ingredient ID:", ingredientId);
    try {
      console.log("🌐 [NUTRITION] Request path: /api/nutrition/{ingredientId}/ingredient");

      // Use fetchClient to automatically include JWT token
      const response = await fetchClient.GET("/api/nutrition/{ingredientId}/ingredient", {
        params: {
          path: {
            ingredientId: ingredientId,
          },
        },
      });

      console.log("📡 [NUTRITION] Response status:", response.response.status);

      if (response.data) {
        console.log("✅ [NUTRITION] Data received:", JSON.stringify(response.data, null, 2));
        setNutritionData((prev) => {
          const newData = {
            ...prev,
            [ingredientId]: response.data,
          };
          console.log("💾 [NUTRITION] Updated nutritionData keys:", Object.keys(newData));
          return newData;
        });
      } else {
        console.warn("⚠️ [NUTRITION] No data received for ingredient:", ingredientId);
      }
    } catch (error) {
      console.error("❌ [NUTRITION] Failed to fetch nutrition for ingredient", ingredientId, error);
    }
  };

  // Calculate total price (base dish price + added ingredients)
  const calculatedPrice = useMemo(() => {
    if (!dish) return 0;

    const basePrice = dish.price || 0;
    const templateRatio = selectedTemplate?.priceRatio || 1.0;

    // Calculate added ingredient costs
    let ingredientCosts = 0;
    Object.values(selectedByCategory).forEach((items) => {
      items.forEach((item) => {
        const ing = ingredientsRaw?.find((i: any) => i.id === item.ingredientId);
        if (ing) {
          // For GRAM unit, multiply by quantity; for other units, just use pricePerUnit
          const priceMultiplier = ing.unit === "GRAM" ? item.quantity : 1;
          ingredientCosts += (ing.pricePerUnit || 0) * priceMultiplier;
        }
      });
    });

    return Math.round((basePrice * templateRatio + ingredientCosts) * quantity);
  }, [dish, selectedTemplate, selectedByCategory, ingredientsRaw, quantity]);

  // Handle template selection
  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
  };

  // Update ingredient quantity
  const updateIngredientQuantity = (
    categoryId: number,
    ingredientId: number,
    newQuantity: number
  ) => {
    setSelectedByCategory((prev) => {
      const categoryItems = prev[categoryId] || [];
      const ingredient = ingredientsRaw?.find((i: any) => i.id === ingredientId);
      const unit = ingredient?.unit?.toUpperCase() || "GRAM";

      // For GRAM: min 200, step 200
      // For others: min 1, step 1
      const minQty = unit === "GRAM" ? 200 : 1;
      const step = unit === "GRAM" ? 200 : 1;

      // Calculate max based on role limit
      const cat = categories.find((c: any) => c.id === categoryId);
      const role = detectCategoryRole(cat?.name);
      const maxParts = maxForRole(role);

      // Calculate current parts for this role (excluding current ingredient)
      const otherParts = categories.reduce((acc: number, c: any) => {
        if (detectCategoryRole(c?.name) !== role) return acc;
        const items = prev[c.id!] || [];
        return (
          acc +
          items.reduce((sum, item) => {
            if (item.ingredientId === ingredientId) return sum; // Exclude current ingredient
            const ing = ingredientsRaw?.find((i: any) => i.id === item.ingredientId);
            if (!ing) return sum;
            const parts = ing.unit?.toUpperCase() === "GRAM" ? item.quantity / 200 : 1;
            return sum + parts;
          }, 0)
        );
      }, 0);

      // Max quantity for this ingredient = (maxParts - otherParts) * 200 for GRAM
      const maxQtyForIngredient =
        unit === "GRAM" ? Math.max(minQty, (maxParts - otherParts) * 200) : 100;

      const clampedQty = Math.max(minQty, Math.min(maxQtyForIngredient, newQuantity));

      return {
        ...prev,
        [categoryId]: categoryItems.map((item) =>
          item.ingredientId === ingredientId ? { ...item, quantity: clampedQty } : item
        ),
      };
    });
  };

  // Get ingredient quantity from selection
  const getIngredientQuantity = (categoryId: number, ingredientId: number): number => {
    const current = selectedByCategory[categoryId] || [];
    const item = current.find((item) => item.ingredientId === ingredientId);
    return item?.quantity || 200; // Default to 200 for GRAM
  };
  // Toggle ingredient selection
  const toggleIngredient = (categoryId: number, ingredientId: number, defaultQuantity: number) => {
    if (!selectedTemplate) {
      Toast.show({
        type: "info",
        text1: "Chọn kích thước bát trước",
        text2: "Vui lòng chọn Size S/M/L để bắt đầu chọn topping",
      });
      return;
    }

    setSelectedByCategory((prev) => {
      const categoryItems = prev[categoryId] || [];
      const existing = categoryItems.find((item) => item.ingredientId === ingredientId);

      if (existing) {
        // Remove ingredient
        return {
          ...prev,
          [categoryId]: categoryItems.filter((item) => item.ingredientId !== ingredientId),
        };
      } else {
        // Check limit before adding
        const cat = categories.find((c: any) => c.id === categoryId);
        const role = detectCategoryRole(cat?.name);
        const max = maxForRole(role);
        const totalParts = calculatePartsForRole(role);

        // Get ingredient to check its unit
        const ing = ingredientsRaw?.find((i: any) => i.id === ingredientId);
        const newIngredientParts = ing?.unit?.toUpperCase() === "GRAM" ? defaultQuantity / 200 : 1;

        if (Number.isFinite(max) && totalParts + newIngredientParts > max) {
          Toast.show({
            type: "info",
            text1: "Đã đạt giới hạn",
            text2: `Bạn đã chọn ${totalParts}/${max} phần cho nhóm ${role}. Không thể thêm nữa.`,
          });
          return prev; // Don't add, return unchanged state
        }

        // Add ingredient as ADDON
        return {
          ...prev,
          [categoryId]: [
            ...categoryItems,
            {
              ingredientId,
              quantity: defaultQuantity,
              sourceType: "ADDON" as const,
            },
          ],
        };
      }
    });
  };

  // Check if ingredient is selected
  const isIngredientSelected = (categoryId: number, ingredientId: number) => {
    return (selectedByCategory[categoryId] || []).some(
      (item) => item.ingredientId === ingredientId
    );
  };

  // Prepare data for NutritionCalculator component
  const ingredientsForCalculator = useMemo(() => {
    console.log("\n🧮 [CALCULATOR] Preparing ingredients for calculator...");
    console.log("📦 [CALCULATOR] selectedByCategory:", selectedByCategory);
    console.log("📊 [CALCULATOR] nutritionData keys:", Object.keys(nutritionData));

    const result: any[] = [];
    Object.values(selectedByCategory).forEach((items) => {
      items.forEach((item) => {
        console.log("🔍 [CALCULATOR] Checking ingredient ID:", item.ingredientId);
        const nutrition = nutritionData[item.ingredientId];

        if (nutrition) {
          console.log("✅ [CALCULATOR] Found nutrition for ID:", item.ingredientId);
          result.push({
            ingredientId: item.ingredientId,
            nutrition: nutrition,
            quantity: item.quantity,
          });
        } else {
          console.log("❌ [CALCULATOR] NO nutrition found for ID:", item.ingredientId);
        }
      });
    });

    console.log("📋 [CALCULATOR] Final result length:", result.length);
    return result;
  }, [selectedByCategory, nutritionData]);

  // Auto-fetch missing nutrition data for selected ingredients
  useEffect(() => {
    const missingNutritionIds: number[] = [];

    Object.values(selectedByCategory).forEach((items) => {
      items.forEach((item) => {
        if (!nutritionData[item.ingredientId]) {
          missingNutritionIds.push(item.ingredientId);
        }
      });
    });

    if (missingNutritionIds.length > 0) {
      console.log("🔄 [AUTO-FETCH] Missing nutrition for IDs:", missingNutritionIds);
      missingNutritionIds.forEach((id) => {
        fetchNutritionForIngredient(id);
      });
    }
  }, [selectedByCategory, nutritionData]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!dish) return;
    if (!selectedTemplate) {
      Toast.show({ type: "error", text1: "Please select a size" });
      return;
    }

    // Flatten selected ingredients into recipe array
    const recipe: RecipeItem[] = [];
    Object.values(selectedByCategory).forEach((items) => {
      recipe.push(...items);
    });

    if (recipe.length === 0) {
      Toast.show({ type: "error", text1: "Please select at least one ingredient" });
      return;
    }

    addItem({
      dishId: 0, // Custom dish, no preset dishId
      basedOnId: dish.id, // Based on this dish
      name: `Custom ${dish.name}`,
      price: calculatedPrice,
      quantity,
      imageUrl: dish.imageUrl,
      dishTemplate: selectedTemplate,
      recipe,
    });

    Toast.show({
      type: "success",
      text1: "Added to cart",
      text2: `${quantity}x Custom ${dish.name}`,
    });

    router.push("/(tabs)/cart");
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
        <Text className="mt-4 text-sm text-gray-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!dishId || !dish) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-lg">Dish not found</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/menu")}
          className="mt-4 rounded-xl bg-[#FF6D00] px-4 py-2">
          <Text className="text-white">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <Pressable onPress={() => router.push(`/(tabs)/menu/${dishId}`)} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-[#000000] dark:text-white">
          Customize {dish.name}
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Dish Image */}
        <View className="items-center bg-white py-6 dark:bg-gray-900">
          {dish?.imageUrl && dish.imageUrl.startsWith("http") ? (
            <Image
              source={{ uri: dish.imageUrl }}
              style={{ width: 360, height: 260, borderRadius: 16 }}
              resizeMode="cover"
            />
          ) : (
            <View className="h-64 w-[360px] items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <MaterialIcons name="restaurant-menu" size={48} color="#FF6D00" />
            </View>
          )}
        </View>

        {/* Dish Info */}
        <View className="px-6 pb-4">
          <Text className="text-2xl font-bold text-[#000000] dark:text-white">{dish.name}</Text>
          {dish.description && (
            <Text className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {dish.description}
            </Text>
          )}
        </View>

        {/* Size Selection */}
        <View className="px-6 pb-4">
          <Text className="mb-3 text-base font-bold text-[#000000] dark:text-white">
            Select Size
          </Text>
          <View className="flex-row gap-3">
            {templates.map((t: any) => {
              const isSelected = selectedTemplate?.size === t.size;
              return (
                <Pressable
                  key={t.size}
                  onPress={() => handleSelectTemplate(t)}
                  className={`flex-1 rounded-xl border-2 p-4 ${
                    isSelected
                      ? "border-[#FF6D00] bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-300 dark:border-gray-700"
                  }`}>
                  <Text
                    className={`text-center text-lg font-bold ${
                      isSelected ? "text-[#FF6D00]" : "text-[#000000] dark:text-white"
                    }`}>
                    {t.size}
                  </Text>
                  <Text className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
                    {t.name}
                  </Text>
                  {t.priceRatio !== 1.0 && (
                    <Text className="mt-1 text-center text-xs font-semibold text-[#FF6D00]">
                      {t.priceRatio}x price
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Ingredients by Category */}
        <View className="px-6 pb-32">
          <Text className="mb-4 text-base font-bold text-[#000000] dark:text-white">
            Customize Ingredients
          </Text>

          {categories.map((category: any) => {
            const ingredients = getIngredientsByCategory(category.id);
            if (ingredients.length === 0) return null;

            return (
              <View key={category.id} className="mb-6">
                <Text className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {category.name}
                </Text>
                <View className="gap-3">
                  {ingredients.map((ing: any) => {
                    const isSelected = isIngredientSelected(category.id, ing.id);
                    const defaultQuantity = ing.unit === "GRAM" ? 200 : 1;
                    const currentQuantity = getIngredientQuantity(category.id, ing.id);
                    const priceMultiplier = ing.unit === "GRAM" ? currentQuantity : 1;
                    const displayPrice = (ing.pricePerUnit || 0) * priceMultiplier;
                    const step = ing.unit === "GRAM" ? 200 : 1;

                    return (
                      <View
                        key={ing.id}
                        className={`flex-row items-center gap-3 rounded-xl border p-3 ${
                          isSelected
                            ? "border-[#FF6D00] bg-orange-50 dark:bg-orange-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}>
                        {/* Ingredient Image */}
                        {ing.imgUrl && ing.imgUrl.startsWith("http") ? (
                          <Image
                            source={{ uri: ing.imgUrl }}
                            style={{ width: 50, height: 50, borderRadius: 8 }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="h-[50px] w-[50px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                            <MaterialIcons name="restaurant" size={24} color="#FF6D00" />
                          </View>
                        )}

                        {/* Ingredient Info */}
                        <View className="flex-1">
                          <Text
                            className={`text-base font-semibold ${
                              isSelected ? "text-[#FF6D00]" : "text-[#000000] dark:text-white"
                            }`}>
                            {ing.name}
                          </Text>
                          <Text className="text-xs text-gray-600 dark:text-gray-400">
                            {currentQuantity}
                            {getShortUnit(ing.unit)} · {formatMoney(displayPrice)}
                          </Text>
                        </View>

                        {/* Quantity Controls or Checkbox */}
                        {isSelected ? (
                          <View className="flex-row items-center gap-2">
                            <Pressable
                              onPress={() =>
                                updateIngredientQuantity(
                                  category.id,
                                  ing.id,
                                  currentQuantity - step
                                )
                              }
                              className="h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                              <MaterialIcons name="remove" size={16} color="#000000" />
                            </Pressable>
                            <Text className="w-12 text-center text-sm font-semibold text-[#FF6D00]">
                              {currentQuantity}
                              {getShortUnit(ing.unit)}
                            </Text>
                            <Pressable
                              onPress={() =>
                                updateIngredientQuantity(
                                  category.id,
                                  ing.id,
                                  currentQuantity + step
                                )
                              }
                              className="h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                              <MaterialIcons name="add" size={16} color="#000000" />
                            </Pressable>
                            <Pressable
                              onPress={() => toggleIngredient(category.id, ing.id, defaultQuantity)}
                              className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                              <MaterialIcons name="close" size={16} color="#EF4444" />
                            </Pressable>
                          </View>
                        ) : (
                          <Pressable
                            onPress={() => toggleIngredient(category.id, ing.id, defaultQuantity)}
                            className={`h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600`}>
                            <MaterialIcons name="add" size={16} color="#666" />
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Overview Section - Collapsible List of ingredients with BASE and ADDON labels */}
      {selectedTemplate && Object.values(selectedByCategory).flat().length > 0 && (
        <View className="mb-10 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          {/* Nutrition Calculator */}
          {ingredientsForCalculator.length > 0 && (
            <View className="mb-4">
              <NutritionCalculator ingredients={ingredientsForCalculator} />
            </View>
          )}

          {/* Base ingredients - Collapsible */}
          {Object.values(selectedByCategory)
            .flat()
            .filter((item) => item.sourceType === "BASE").length > 0 && (
            <Collapsible open={isBaseOpen} onOpenChange={setIsBaseOpen}>
              <CollapsibleTrigger asChild>
                <Pressable className="mb-2 flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-[#4CAF50]">Already</Text>
                  <MaterialIcons
                    name={isBaseOpen ? "expand-less" : "expand-more"}
                    size={20}
                    color="#4CAF50"
                  />
                </Pressable>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <View className="mb-3">
                  {categories.map((cat: any) => {
                    const baseItems = (selectedByCategory[cat.id!] || []).filter(
                      (item) => item.sourceType === "BASE"
                    );
                    if (baseItems.length === 0) return null;

                    const role = detectCategoryRole(cat?.name);
                    const roleLabel =
                      role === "CARB"
                        ? "Starch"
                        : role === "PROTEIN"
                          ? "Protein"
                          : role === "VEGETABLE"
                            ? "Green Vegetables"
                            : "Side Dishes";

                    return baseItems.map((item) => {
                      const ing = ingredientsRaw?.find((i: any) => i.id === item.ingredientId);
                      if (!ing) return null;

                      const priceMultiplier = ing.unit === "GRAM" ? item.quantity : 1;
                      const itemPrice = (ing.pricePerUnit || 0) * priceMultiplier;

                      return (
                        <View
                          key={`base-${cat.id}-${item.ingredientId}`}
                          className="mb-1 flex-row items-center justify-between border-b border-gray-100 py-1 dark:border-gray-700">
                          <View className="flex-1">
                            <Text className="text-sm font-medium text-[#000000] dark:text-white">
                              {ing.name}
                            </Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                              {roleLabel} • {item.quantity}
                              {getShortUnit(ing.unit)}
                            </Text>
                          </View>
                          <Text className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                            {formatMoney(itemPrice)}
                          </Text>
                        </View>
                      );
                    });
                  })}
                </View>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Added ingredients - Collapsible */}
          {Object.values(selectedByCategory)
            .flat()
            .filter((item) => item.sourceType === "ADDON").length > 0 && (
            <Collapsible open={isAddedOpen} onOpenChange={setIsAddedOpen}>
              <CollapsibleTrigger asChild>
                <Pressable className="mb-2 flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-[#FF6D00]">Added</Text>
                  <MaterialIcons
                    name={isAddedOpen ? "expand-less" : "expand-more"}
                    size={20}
                    color="#FF6D00"
                  />
                </Pressable>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ScrollView className="max-h-38" nestedScrollEnabled showsVerticalScrollIndicator>
                  {categories.map((cat: any) => {
                    const addonItems = (selectedByCategory[cat.id!] || []).filter(
                      (item) => item.sourceType === "ADDON"
                    );
                    if (addonItems.length === 0) return null;

                    const role = detectCategoryRole(cat?.name);
                    const roleLabel =
                      role === "CARB"
                        ? "Starch"
                        : role === "PROTEIN"
                          ? "Protein"
                          : role === "VEGETABLE"
                            ? "Green Vegetables"
                            : "Side Dishes";

                    return addonItems.map((item) => {
                      const ing = ingredientsRaw?.find((i: any) => i.id === item.ingredientId);
                      if (!ing) return null;

                      const priceMultiplier = ing.unit === "GRAM" ? item.quantity : 1;
                      const itemPrice = (ing.pricePerUnit || 0) * priceMultiplier;

                      return (
                        <View
                          key={`addon-${cat.id}-${item.ingredientId}`}
                          className="mb-1 flex-row items-center justify-between border-b border-gray-100 py-1 dark:border-gray-700">
                          <View className="flex-1">
                            <Text className="text-sm font-medium text-[#000000] dark:text-white">
                              {ing.name}
                            </Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                              {roleLabel} • {item.quantity}
                              {getShortUnit(ing.unit)}
                            </Text>
                          </View>
                          <Text className="ml-2 text-sm font-semibold text-[#FF6D00]">
                            +{formatMoney(itemPrice)}
                          </Text>
                        </View>
                      );
                    });
                  })}
                </ScrollView>
              </CollapsibleContent>
            </Collapsible>
          )}
        </View>
      )}

      {/* Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        {/* Nutrition Calculator */}
        {ingredientsForCalculator.length > 0 && (
          <View className="mb-4">
            <NutritionCalculator ingredients={ingredientsForCalculator} />
          </View>
        )}

        <View className="flex-row items-center justify-between">
          {/* Quantity Control */}
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-10 w-10 items-center justify-center rounded-full border border-gray-300 dark:border-gray-600">
              <MaterialIcons name="remove" size={20} color="#000000" />
            </Pressable>
            <Text className="text-lg font-semibold text-[#000000] dark:text-white">{quantity}</Text>
            <Pressable
              onPress={() => setQuantity(quantity + 1)}
              className="h-10 w-10 items-center justify-center rounded-full border border-gray-300 dark:border-gray-600">
              <MaterialIcons name="add" size={20} color="#000000" />
            </Pressable>
          </View>

          {/* Price and Add Button */}
          <View className="flex-row items-center gap-3">
            <Text className="text-xl font-bold text-[#FF6D00]">{formatMoney(calculatedPrice)}</Text>
            <Pressable onPress={handleAddToCart} className="rounded-full bg-[#FF6D00] px-6 py-3">
              <Text className="font-semibold text-white">Add to Cart</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
