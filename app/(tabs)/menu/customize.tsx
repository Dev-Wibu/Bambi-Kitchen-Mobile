import { Text } from "@/components/ui/text";
import { useDishTemplates } from "@/services/dishService";
import { useIngredientCategories } from "@/services/ingredientCategoryService";
import { useIngredients } from "@/services/ingredientService";
import { useCartStore } from "@/stores/cartStore";
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

  // Enforce business rules: CARB=1 always; PROTEIN S/M/L = 2/3/4; VEGETABLE S/M/L = 3/4/5
  const maxForRole = (role: Role) => {
    if (!selectedTemplate) return Infinity;
    const size = normalizeSize(selectedTemplate.size);
    if (role === "CARB") return 1;
    if (role === "PROTEIN") return size === "S" ? 2 : size === "M" ? 3 : 4;
    if (role === "VEGETABLE") return size === "S" ? 3 : size === "M" ? 4 : 5;
    return Infinity;
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
    const totalForRole = categories.reduce((acc: number, c: any) => {
      return (
        acc + (detectCategoryRole(c?.name) === role ? (selectedByCategory[c.id!] || []).length : 0)
      );
    }, 0);
    if (Number.isFinite(max) && totalForRole >= max) {
      Toast.show({
        type: "info",
        text1: "Đã đạt giới hạn",
        text2: `Bạn đã chọn tối đa ${max} mục cho nhóm ${role}. Hãy bỏ bớt để chọn thêm.`,
      });
      return;
    }

    setSelectedByCategory({
      ...selectedByCategory,
      [categoryId]: [
        ...current,
        {
          ingredientId: ingredient.id!,
          quantity: 1,
          sourceType: "ADDON",
        },
      ],
    });
  };

  // Check if ingredient is selected
  const isIngredientSelected = (categoryId: number, ingredientId: number) => {
    const current = selectedByCategory[categoryId] || [];
    return current.some((item) => item.ingredientId === ingredientId);
  };

  // Calculate total price
  const calculateTotal = () => {
    let total = 1800; // Base $18
    if (selectedTemplate) {
      total = Math.round(total * (selectedTemplate.priceRatio || 1));
    }
    // Add ingredient prices (use pricePerUnit if available)
    Object.values(selectedByCategory).forEach((items) => {
      items.forEach((item) => {
        const ing = ingredientsRaw?.find((i: any) => i.id === item.ingredientId);
        if (ing) total += (ing.pricePerUnit || 0) * item.quantity;
      });
    });
    return total;
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
      const count = (selectedByCategory[c.id!] || []).length;
      // role is narrowed to Role; safe to index
      countsByRole[role] += count;
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
        text2: `Nhóm ${over.role} đã chọn ${over.count}/${over.max}. Hãy bỏ bớt trước khi thêm vào giỏ.`,
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
      text2: `${quantity}× Custom ${selectedTemplate.size} Bowl - $${((calculateTotal() * quantity) / 100).toFixed(2)}`,
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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <Pressable onPress={() => router.back()} className="mr-3">
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
                      <Text className="mt-1 text-sm font-semibold text-[#FF6D00]">
                        Price ratio: {template.priceRatio}x
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
            const selectedInRole = categories.reduce((acc: number, c: any) => {
              return (
                acc +
                (detectCategoryRole(c?.name) === role
                  ? (selectedByCategory[c.id!] || []).length
                  : 0)
              );
            }, 0);
            return (
              <View key={cat.id} className="border-t border-gray-200 px-6 py-6">
                <View className="mb-3 flex-row items-end justify-between">
                  <View>
                    <Text className="text-base font-bold text-[#000000] dark:text-white">
                      {cat.name}
                    </Text>
                    {Number.isFinite(max) && (
                      <Text className="mt-1 text-xs text-gray-500">
                        Chọn tối đa {max} • Đã chọn {selectedInRole}
                      </Text>
                    )}
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-3">
                    {items.map((ingredient: any) => {
                      const picked = isIngredientSelected(cat.id!, ingredient.id);
                      const reachLimit = !picked && Number.isFinite(max) && selectedInRole >= max;
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
                              +{ingredient.pricePerUnit}
                            </Text>
                          ) : null}
                          <View className="mt-2 items-end">
                            <View
                              className={`h-6 w-6 items-center justify-center rounded ${
                                picked ? "bg-[#FF6D00]" : "border-2 border-gray-300"
                              }`}>
                              {picked && <MaterialIcons name="check" size={16} color="white" />}
                            </View>
                          </View>
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

      {/* Bottom Bar */}
      {selectedTemplate && (
        <View className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {selectedTemplate.size} Bowl • {Object.values(selectedByCategory).flat().length}{" "}
              ingredients
            </Text>
            <Text className="text-2xl font-bold text-[#FF6D00]">
              ${(calculateTotal() / 100).toFixed(2)}
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
