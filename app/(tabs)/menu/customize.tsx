import { NutritionCalculator } from "@/components/nutrition";
import { Text } from "@/components/ui/text";
import { fetchClient } from "@/libs/api";
import { useDishTemplates } from "@/services/dishService";
import { useIngredientCategories } from "@/services/ingredientCategoryService";
import { useIngredients } from "@/services/ingredientService";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/utils/currency";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type RecipeItem = {
  ingredientId: number;
  quantity: number;
  sourceType: "BASE" | "ADDON";
};

export default function CustomizeBowlScreen() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Selected template
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Selected ingredients {categoryId: RecipeItem[]}
  const [selectedByCategory, setSelectedByCategory] = useState<{ [key: number]: RecipeItem[] }>({});

  // Store nutrition data for ingredients: {ingredientId: Nutrition}
  const [nutritionData, setNutritionData] = useState<{ [key: number]: any }>({});

  const [quantity, setQuantity] = useState(1);

  // Fetch data
  const { data: templatesRaw, isLoading: loadingTemplates } = useDishTemplates();
  const { data: categoriesRaw, isLoading: loadingCategories } = useIngredientCategories();
  const { data: ingredientsRaw, isLoading: loadingIngredients } = useIngredients();

  const isLoading = loadingTemplates || loadingCategories || loadingIngredients;

  // Normalize size helper to avoid whitespace/case issues from BE
  const normalizeSize = (s?: string) => (s ? String(s).trim().toUpperCase() : "");

  // Sort templates: S, M, L
  const templates = useMemo(() => {
    if (!templatesRaw) return [];
    return [...templatesRaw].sort((a, b) => {
      const order: { [key: string]: number } = { S: 1, M: 2, L: 3 };
      return (order[normalizeSize(a.size)] || 99) - (order[normalizeSize(b.size)] || 99);
    });
  }, [templatesRaw]);

  // Auto-select a default size (prefer M, else first) so users can proceed quickly
  useEffect(() => {
    if (!selectedTemplate && templates.length > 0) {
      const preferred = templates.find((t: any) => normalizeSize(t.size) === "M") || templates[0];
      setSelectedTemplate(preferred);
    }
  }, [templates, selectedTemplate]);

  // Filter unique categories (avoid duplicates)
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

  // Get ingredients for a category (BE shape: ingredient.category.id)
  const getIngredientsByCategory = (categoryId: number) => {
    return (
      ingredientsRaw?.filter(
        (ing: any) => ing?.category?.id === categoryId && ing?.active !== false
      ) || []
    );
  };

  // Handle template selection
  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
  };

  // Convert unit to short form for display
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
        return unit.toLowerCase().slice(0, 3); // Fallback: first 3 chars
    }
  };

  // Deterministic role mapping by category name (VN diacritics tolerant)
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
    // Exact mapping from provided data
    if (has(["tinh bot"])) return "CARB"; // carbs
    if (has(["thit", "hai san"])) return "PROTEIN"; // meat + seafood
    if (has(["rau tuoi", "rau va co", "trai cay", "hat & dau", "nam"])) return "VEGETABLE";
    if (has(["sot", "nuoc"])) return "OTHER"; // dressings & drinks (no limits)
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

  // Toggle ingredient selection inside a category with per-size limits
  const toggleIngredient = (categoryId: number, ingredient: any) => {
    if (!selectedTemplate) {
      Toast.show({
        type: "info",
        text1: "Chọn kích thước bát trước",
        text2: "Vui lòng chọn Size S/M/L để bắt đầu chọn topping",
      });
      return;
    }
    const current = selectedByCategory[categoryId] || [];
    const exists = current.find((item) => item.ingredientId === ingredient.id);

    if (exists) {
      // Remove
      setSelectedByCategory({
        ...selectedByCategory,
        [categoryId]: current.filter((item) => item.ingredientId !== ingredient.id),
      });
      return;
    }

    // Enforce limit by role (aggregate across all categories of same role)
    const cat = categories.find((c: any) => c.id === categoryId);
    const role = detectCategoryRole(cat?.name);
    const max = maxForRole(role);
    const totalParts = calculatePartsForRole(role);

    // When adding a new ingredient, count it as 1 part (200g for GRAM)
    const newIngredientParts = ingredient.unit?.toUpperCase() === "GRAM" ? 1 : 1;

    if (Number.isFinite(max) && totalParts + newIngredientParts > max) {
      Toast.show({
        type: "info",
        text1: "Đã đạt giới hạn",
        text2: `Bạn đã chọn ${totalParts}/${max} phần cho nhóm ${role}. Không thể thêm nữa.`,
      });
      return;
    }

    // Get ingredient unit to determine default quantity
    const ingredientUnit = ingredient.unit?.toUpperCase() || "GRAM";
    const defaultQuantity = ingredientUnit === "GRAM" ? 200 : 1;

    setSelectedByCategory({
      ...selectedByCategory,
      [categoryId]: [
        ...current,
        {
          ingredientId: ingredient.id!,
          quantity: defaultQuantity, // 200 for GRAM, 1 for others
          sourceType: "ADDON",
        },
      ],
    });

    // Fetch nutrition data for this ingredient if not already fetched
    console.log("🍽️ [INGREDIENT] Selected ingredient:", ingredient.name, "ID:", ingredient.id);
    console.log("📊 [NUTRITION CHECK] Current nutritionData keys:", Object.keys(nutritionData));

    if (!nutritionData[ingredient.id!]) {
      console.log("🔄 [NUTRITION] Nutrition not cached, fetching for ID:", ingredient.id);
      fetchNutritionForIngredient(ingredient.id!);
    } else {
      console.log("✓ [NUTRITION] Nutrition already cached for ID:", ingredient.id);
    }
  };

  // Update ingredient quantity
  const updateIngredientQuantity = (
    categoryId: number,
    ingredientId: number,
    newQuantity: number
  ) => {
    const current = selectedByCategory[categoryId] || [];
    // Get ingredient unit to determine min/max/step
    const ingredient = ingredientsRaw?.find((i: any) => i.id === ingredientId);
    const unit = ingredient?.unit?.toUpperCase() || "GRAM";

    // For GRAM: min 200, max depends on role limit
    // For others: min 1, max 100
    const minQty = unit === "GRAM" ? 200 : 1;

    // Calculate max based on role limit
    const cat = categories.find((c: any) => c.id === categoryId);
    const role = detectCategoryRole(cat?.name);
    const maxParts = maxForRole(role);

    // Calculate current parts for this role (excluding current ingredient)
    const otherParts = categories.reduce((acc: number, c: any) => {
      if (detectCategoryRole(c?.name) !== role) return acc;
      const items = selectedByCategory[c.id!] || [];
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

    setSelectedByCategory({
      ...selectedByCategory,
      [categoryId]: current.map((item) =>
        item.ingredientId === ingredientId ? { ...item, quantity: clampedQty } : item
      ),
    });
  };

  // Get ingredient from selection
  const getIngredientQuantity = (categoryId: number, ingredientId: number): number => {
    const current = selectedByCategory[categoryId] || [];
    const item = current.find((item) => item.ingredientId === ingredientId);
    // Get ingredient unit to determine default
    const ingredient = ingredientsRaw?.find((i: any) => i.id === ingredientId);
    const unit = ingredient?.unit?.toUpperCase() || "GRAM";
    const defaultQuantity = unit === "GRAM" ? 200 : 1;
    return item?.quantity || defaultQuantity;
  };

  // Check if ingredient is selected
  const isIngredientSelected = (categoryId: number, ingredientId: number) => {
    const current = selectedByCategory[categoryId] || [];
    return current.some((item) => item.ingredientId === ingredientId);
  };

  // Calculate total price
  // Formula for CUSTOM dish (no base): SUM(ingredient costs) × priceRatio = finalPrice
  // As per BE requirement: "Adding the price of a custom dish is adding the total of the ingredients
  // and multiplying it by the price ratio to get the final price"
  const calculateTotal = () => {
    // Calculate ingredient costs
    let ingredientCosts = 0;
    Object.values(selectedByCategory).forEach((items) => {
      items.forEach((item) => {
        const ing = ingredientsRaw?.find((i: any) => i.id === item.ingredientId);
        if (ing) {
          // For GRAM unit, pricePerUnit is per 1g, so multiply by quantity (200g default)
          // For other units (KILOGRAM, LITER, PCS), pricePerUnit is already correct
          ingredientCosts += (ing.pricePerUnit || 0) * (item.quantity || 1);
        }
      });
    });

    // Apply priceRatio to ingredient total for custom bowls (no base price for 100% custom)
    const priceRatio = selectedTemplate?.priceRatio || 1;
    const finalPrice = Math.round(ingredientCosts * priceRatio);

    return finalPrice;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedTemplate) {
      Toast.show({
        type: "error",
        text1: "Select a size",
        text2: "Please choose a bowl size (S/M/L)",
      });
      return;
    }

    // Validate per-size limits for each role
    const countsByRole: Record<Role, number> = {
      CARB: 0,
      PROTEIN: 0,
      VEGETABLE: 0,
      OTHER: 0,
    };
    categories.forEach((c: any) => {
      const role = detectCategoryRole(c?.name);
      const items = selectedByCategory[c.id!] || [];
      const parts = items.reduce((sum, item) => {
        const ing = ingredientsRaw?.find((i: any) => i.id === item.ingredientId);
        if (!ing) return sum;
        // For GRAM: 200g = 1 part
        const itemParts = ing.unit?.toUpperCase() === "GRAM" ? item.quantity / 200 : 1;
        return sum + itemParts;
      }, 0);
      countsByRole[role] += parts;
    });
    const over: { role: "CARB" | "PROTEIN" | "VEGETABLE"; max: number; count: number } | null = ((
      r
    ) => {
      for (const role of ["CARB", "PROTEIN", "VEGETABLE"] as const) {
        const max = maxForRole(role);
        const count = countsByRole[role];
        if (Number.isFinite(max) && count > max) return { role, max: max as number, count };
      }
      return null;
    })();
    if (over) {
      Toast.show({
        type: "error",
        text1: "Vượt quá giới hạn",
        text2: `Nhóm ${over.role} đã chọn ${over.count}/${over.max} phần. Hãy bỏ bớt trước khi thêm vào giỏ.`,
      });
      return;
    }

    // Build recipe array
    const recipe: RecipeItem[] = [];
    Object.values(selectedByCategory).forEach((items) => {
      recipe.push(...items);
    });

    if (recipe.length === 0) {
      Toast.show({
        type: "error",
        text1: "Add ingredients",
        text2: "Please select at least one ingredient",
      });
      return;
    }

    // Add to cart
    addItem({
      dishId: 0,
      name: `Custom ${selectedTemplate.size} Bowl`,
      price: calculateTotal(),
      quantity: quantity,
      imageUrl:
        "https://s3.eu-central-1.amazonaws.com/easyorder-images/prod/products/2674a64b-9741-4c6b-9f31-0d5c35d6ad0e/large/b37492f9d64f851651b03f63e72d81640df380cf028a3d215626e546d429e01a.png",
      dishTemplate: selectedTemplate,
      recipe: recipe as any,
    });

    Toast.show({
      type: "success",
      text1: "Added to cart!",
      text2: `${quantity}× Custom ${selectedTemplate.size} Bowl - ${formatMoney(calculateTotal() * quantity)}`,
    });

    // Go straight to Cart to review and select payment
    router.push("/(tabs)/cart");
  };

  // Build sections: each category that has at least one ingredient
  const sections = useMemo(() => {
    return categories
      .map((cat: any) => ({
        cat,
        items:
          ingredientsRaw?.filter(
            (ing: any) => ing?.category?.id === cat.id && ing?.active !== false
          ) || [],
      }))
      .filter((s) => s.items.length > 0);
  }, [categories, ingredientsRaw]);

  // Prepare data for NutritionCalculator component
  const ingredientsForCalculator = useMemo(() => {
    console.log("\n🧮 [CALCULATOR] Preparing ingredients for calculator...");
    console.log("📦 [CALCULATOR] selectedByCategory:", selectedByCategory);
    console.log("📊 [CALCULATOR] nutritionData keys:", Object.keys(nutritionData));
    console.log("📊 [CALCULATOR] nutritionData full:", nutritionData);

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
    console.log("📋 [CALCULATOR] Final result:", result);
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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <Pressable onPress={() => router.push("/(tabs)/menu")} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-[#000000] dark:text-white">
          Make your own bowl
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF6D00" />
        </View>
      ) : (
        <ScrollView className="flex-1">
          {/* Large Bowl Image */}
          <View className="items-center bg-white py-8">
            <Image
              source={{
                uri: "https://s3.eu-central-1.amazonaws.com/easyorder-images/prod/products/2674a64b-9741-4c6b-9f31-0d5c35d6ad0e/large/b37492f9d64f851651b03f63e72d81640df380cf028a3d215626e546d429e01a.png",
              }}
              style={{ width: 350, height: 350 }}
              resizeMode="contain"
            />
          </View>

          {/* Description */}
          <View className="border-t border-gray-200 px-6 py-4">
            <Text className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              Let your creativity run free and be the artist of your own lunch or dinner. Find your
              perfect Poké combo to truly indulge in the Bambi taste!
            </Text>
          </View>

          {/* Step 0: Choose Size */}
          {
            <View className="border-t border-gray-200 px-6 py-6">
              <Text className="mb-4 text-base font-bold text-[#000000] dark:text-white">
                Choose Your Bowl Size
              </Text>
              <View className="gap-3">
                {templates.map((template: any, idx: number) => (
                  <Pressable
                    key={`${normalizeSize(template.size)}-${idx}`}
                    onPress={() => handleSelectTemplate(template)}
                    className={`flex-row items-center rounded-xl border-2 p-4 ${
                      normalizeSize(selectedTemplate?.size) === normalizeSize(template.size)
                        ? "border-[#FF6D00] bg-[#FF6D00]/10"
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                    <View className="flex-1">
                      <Text
                        className={`text-2xl font-bold ${
                          normalizeSize(selectedTemplate?.size) === normalizeSize(template.size)
                            ? "text-[#FF6D00]"
                            : "text-[#000000] dark:text-white"
                        }`}>
                        Size {normalizeSize(template.size)}
                      </Text>
                      <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {template.name}
                      </Text>
                    </View>
                    <MaterialIcons
                      name={
                        normalizeSize(selectedTemplate?.size) === normalizeSize(template.size)
                          ? "radio-button-checked"
                          : "radio-button-unchecked"
                      }
                      size={24}
                      color={
                        normalizeSize(selectedTemplate?.size) === normalizeSize(template.size)
                          ? "#FF6D00"
                          : "#D1D5DB"
                      }
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          }

          {/* Ingredient sections by category — horizontal scroll, no next/prev */}
          {sections.map(({ cat, items }) => {
            const role = detectCategoryRole(cat?.name);
            const max = maxForRole(role);
            const selectedParts = calculatePartsForRole(role);
            return (
              <View key={cat.id} className="border-t border-gray-200 px-6 py-6">
                <View className="mb-3 flex-row items-end justify-between">
                  <View>
                    <Text className="text-base font-bold text-[#000000] dark:text-white">
                      {cat.name}
                    </Text>
                    {Number.isFinite(max) && (
                      <Text className="mt-1 text-xs text-gray-500">
                        Chọn tối đa {max} phần • Đã chọn {selectedParts.toFixed(1)} phần
                      </Text>
                    )}
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-3">
                    {items.map((ingredient: any) => {
                      const picked = isIngredientSelected(cat.id!, ingredient.id);
                      const newIngredientParts = ingredient.unit?.toUpperCase() === "GRAM" ? 1 : 1;
                      const reachLimit =
                        !picked && Number.isFinite(max) && selectedParts + newIngredientParts > max;
                      const step = ingredient.unit === "GRAM" ? 200 : 1;

                      return (
                        <Pressable
                          key={ingredient.id}
                          onPress={() => !reachLimit && toggleIngredient(cat.id!, ingredient)}
                          className={`w-[140px] rounded-xl border-2 p-3 ${
                            picked
                              ? "border-[#FF6D00] bg-[#FF6D00]/10"
                              : reachLimit
                                ? "border-gray-200 opacity-50"
                                : "border-gray-200 dark:border-gray-700"
                          }`}>
                          {ingredient.imgUrl ? (
                            <Image
                              source={{ uri: ingredient.imgUrl }}
                              style={{ width: "100%", height: 90, borderRadius: 10 }}
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="h-[90px] w-full items-center justify-center rounded-lg bg-gray-200">
                              <Text className="text-xl font-bold text-gray-600">
                                {ingredient.name?.charAt(0)}
                              </Text>
                            </View>
                          )}
                          <Text className="mt-2 font-medium text-[#000000] dark:text-white">
                            {ingredient.name}
                          </Text>
                          {ingredient.pricePerUnit ? (
                            <Text className="mt-1 text-xs text-gray-600">
                              {ingredient.pricePerUnit * step}đ
                            </Text>
                          ) : null}

                          {/* Quantity controls - shown when ingredient is selected */}
                          {picked ? (
                            <View className="mt-2 flex-row items-center justify-between">
                              <Pressable
                                onPress={(e) => {
                                  e.stopPropagation();
                                  const currentQty = getIngredientQuantity(cat.id!, ingredient.id);
                                  const unit = ingredient.unit?.toUpperCase() || "GRAM";
                                  const step = unit === "GRAM" ? 200 : 1;
                                  updateIngredientQuantity(
                                    cat.id!,
                                    ingredient.id,
                                    currentQty - step
                                  );
                                }}
                                className="h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                                <MaterialIcons name="remove" size={12} color="#000000" />
                              </Pressable>
                              <Text className="text-xs font-semibold text-[#FF6D00]">
                                {getIngredientQuantity(cat.id!, ingredient.id)}
                                {getShortUnit(ingredient.unit)}
                              </Text>
                              <Pressable
                                onPress={(e) => {
                                  e.stopPropagation();
                                  const currentQty = getIngredientQuantity(cat.id!, ingredient.id);
                                  const unit = ingredient.unit?.toUpperCase() || "GRAM";
                                  const step = unit === "GRAM" ? 200 : 1;
                                  updateIngredientQuantity(
                                    cat.id!,
                                    ingredient.id,
                                    currentQty + step
                                  );
                                }}
                                className="h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                                <MaterialIcons name="add" size={12} color="#000000" />
                              </Pressable>
                            </View>
                          ) : (
                            <View className="mt-2 items-end">
                              <View
                                className={`h-6 w-6 items-center justify-center rounded ${
                                  picked ? "bg-[#FF6D00]" : "border-2 border-gray-300"
                                }`}>
                                {picked && <MaterialIcons name="check" size={16} color="white" />}
                              </View>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Overview Section - List of selected ingredients */}
      {selectedTemplate && Object.values(selectedByCategory).flat().length > 0 && (
        <View className="border-t border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
          {ingredientsForCalculator.length > 0 && (
            <View className="mb-4">
              <NutritionCalculator ingredients={ingredientsForCalculator} />
            </View>
          )}
          <Text className="mb-2 text-sm font-bold text-[#FF6D00]">Selected:</Text>
          {/* Nutrition Calculator */}

          <ScrollView className="max-h-32">
            {categories.map((cat: any) => {
              const selectedItems = selectedByCategory[cat.id!] || [];
              if (selectedItems.length === 0) return null;

              const role = detectCategoryRole(cat?.name);
              const roleLabel =
                role === "CARB"
                  ? "Starch"
                  : role === "PROTEIN"
                    ? "Protein"
                    : role === "VEGETABLE"
                      ? "Green Vegetables"
                      : "Side Dishes";

              return selectedItems.map((item) => {
                const ing = ingredientsRaw?.find((i: any) => i.id === item.ingredientId);
                if (!ing) return null;

                const priceMultiplier = ing.unit === "GRAM" ? item.quantity : 1;
                const itemPrice = (ing.pricePerUnit || 0) * priceMultiplier;

                return (
                  <View
                    key={`${cat.id}-${item.ingredientId}`}
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
        </View>
      )}

      {/* Bottom Bar */}
      {selectedTemplate && (
        <View className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          {/* Nutrition Calculator */}
          {(() => {
            console.log("\n🎨 [RENDER] Checking if should render NutritionCalculator...");
            console.log(
              "🎨 [RENDER] ingredientsForCalculator.length:",
              ingredientsForCalculator.length
            );
            console.log("🎨 [RENDER] selectedTemplate:", selectedTemplate?.size);
            return ingredientsForCalculator.length > 0;
          })() && (
            <View className="mb-4">
              <NutritionCalculator ingredients={ingredientsForCalculator} />
            </View>
          )}

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {selectedTemplate.size} Bowl • {Object.values(selectedByCategory).flat().length}{" "}
              ingredients
            </Text>
            <Text className="text-2xl font-bold text-[#FF6D00]">
              {formatMoney(calculateTotal())}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            {/* Quantity */}
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 items-center justify-center rounded-full border border-gray-300">
                <MaterialIcons name="remove" size={20} color="#000000" />
              </Pressable>
              <Text className="w-8 text-center text-lg font-bold text-[#000000] dark:text-white">
                {quantity}
              </Text>
              <Pressable
                onPress={() => setQuantity(quantity + 1)}
                className="h-10 w-10 items-center justify-center rounded-full border border-gray-300">
                <MaterialIcons name="add" size={20} color="#000000" />
              </Pressable>
            </View>

            {/* Add to Cart */}
            <Pressable
              onPress={handleAddToCart}
              className="flex-1 rounded-full bg-[#FF6D00] py-3 active:bg-[#FF4D00]">
              <View className="flex-row items-center justify-center">
                <MaterialIcons name="shopping-cart" size={20} color="white" />
                <Text className="ml-2 font-bold text-white">Add to cart</Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
