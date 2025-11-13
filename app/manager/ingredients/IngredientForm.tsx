import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { Ingredient } from "@/interfaces/ingredient.interface";
import type { IngredientCategory } from "@/interfaces/ingredientCategory.interface";
import { API_BASE_URL } from "@/libs/api";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

interface IngredientFormProps {
  visible: boolean;
  ingredient: Ingredient | null;
  categories: IngredientCategory[];
  categoriesLoading: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IngredientForm({
  visible,
  ingredient,
  categories,
  categoriesLoading,
  onClose,
  onSuccess,
}: IngredientFormProps) {
  const queryClient = useQueryClient();

  // Form fields
  const [name, setName] = useState(ingredient?.name || "");
  const [categoryId, setCategoryId] = useState(ingredient?.category?.id?.toString() || "");
  const [quantity, setQuantity] = useState(ingredient?.quantity?.toString() || "");
  const [unit, setUnit] = useState<"GRAM" | "KILOGRAM" | "LITER" | "PCS">(
    ingredient?.unit || "GRAM"
  );
  const [pricePerUnit, setPricePerUnit] = useState(ingredient?.pricePerUnit?.toString() || "");
  const [active, setActive] = useState(ingredient?.active ?? true);
  const [submitting, setSubmitting] = useState(false);

  // Update form when ingredient changes
  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name || "");
      setCategoryId(ingredient.category?.id?.toString() || "");
      setQuantity(ingredient.quantity?.toString() || "");
      setUnit(ingredient.unit || "GRAM");
      setPricePerUnit(ingredient.pricePerUnit?.toString() || "");
      setActive(ingredient.active ?? true);
    } else {
      setName("");
      setCategoryId("");
      setQuantity("");
      setUnit("GRAM");
      setPricePerUnit("");
      setActive(true);
    }
  }, [ingredient]);

  const handleSubmit = async () => {
    console.log("🚀 [IngredientForm] Starting form submission", {
      mode: ingredient?.id ? "UPDATE" : "CREATE",
      ingredientId: ingredient?.id,
      formData: { name, categoryId, quantity, unit, pricePerUnit, active },
    });

    if (!name.trim()) {
      console.log("❌ [IngredientForm] Validation failed: Name is required");
      Toast.show({ type: "error", text1: "Name is required" });
      return;
    }
    if (name.trim().length < 10) {
      console.log("❌ [IngredientForm] Validation failed: Name too short", {
        length: name.trim().length,
      });
      Toast.show({ type: "error", text1: "Name must be at least 10 characters" });
      return;
    }
    if (!categoryId) {
      console.log("❌ [IngredientForm] Validation failed: Category is required");
      Toast.show({ type: "error", text1: "Category is required" });
      return;
    }
    // Validate categoryId is a valid number
    const categoryIdNum = parseInt(categoryId);
    if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
      console.log("❌ [IngredientForm] Validation failed: Invalid category ID", { categoryId });
      Toast.show({ type: "error", text1: "Invalid category ID" });
      return;
    }

    console.log("✅ [IngredientForm] Validation passed, preparing FormData");

    setSubmitting(true);

    try {
      // BE uses @ModelAttribute expecting multipart/form-data
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("categoryId", categoryId);
      formData.append("quantity", quantity || "0");
      formData.append("unit", unit);
      formData.append("pricePerUnit", pricePerUnit || "0");

      // IMPORTANT: Always send a file field to prevent BE NullPointerException
      // BE code calls file.isEmpty() without null check, so file must not be null
      // Send an empty blob when no image is selected (React Native compatible)
      // Using data URI for empty file - React Native FormData will convert this to empty MultipartFile
      const emptyBlob = {
        uri: "data:application/octet-stream;base64,",
        type: "application/octet-stream",
        name: "empty.txt",
      };
      formData.append("file", emptyBlob as any);

      // Always send active status for both create and update
      formData.append("active", String(active));

      if (ingredient?.id) {
        // Update mode: add id field and preserve stock fields
        formData.append("id", ingredient.id.toString());

        // Preserve existing stock values when updating
        // These fields are required by IngredientUpdateRequest
        if (ingredient.quantity !== undefined) {
          formData.append("quantity", ingredient.quantity.toString());
        }
        if (ingredient.available !== undefined) {
          formData.append("available", ingredient.available.toString());
        }
        if (ingredient.reserve !== undefined) {
          formData.append("reserve", ingredient.reserve.toString());
        }
      }

      console.log("📤 [IngredientForm] Sending request to API", {
        method: ingredient?.id ? "PUT" : "POST",
        url: `${API_BASE_URL}/api/ingredient`,
      });

      // Get auth token
      const token = useAuthStore.getState().token;
      const url = `${API_BASE_URL}/api/ingredient`;

      const response = await fetch(url, {
        method: ingredient?.id ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary
        },
        body: formData,
      });

      console.log("📥 [IngredientForm] Received response", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ [IngredientForm] API error response:", errorText);
        // Try to parse error as JSON to extract BE message
        let errorMessage = ingredient ? "Update failed" : "Create failed";
        try {
          const errorJson = JSON.parse(errorText);
          // Extract error message from BE response
          errorMessage = errorJson.message || errorJson.error || errorText;
          console.log("📋 [IngredientForm] Parsed error message:", errorMessage);
        } catch {
          // If not JSON, use raw error text
          errorMessage = errorText;
          console.log("📋 [IngredientForm] Using raw error text:", errorMessage);
        }
        throw new Error(errorMessage);
      }

      // Success - Extract success message from BE if available
      const responseData = await response.json();
      const successMessage =
        responseData?.message ||
        (ingredient ? "Ingredient updated successfully" : "Ingredient created successfully");

      console.log("✅ [IngredientForm] Operation successful:", {
        message: successMessage,
        data: responseData,
      });

      Toast.show({ type: "success", text1: "Success", text2: successMessage });

      console.log("🔄 [IngredientForm] Invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["/api/ingredient"] });
      onSuccess();
      console.log("✅ [IngredientForm] Form closed successfully");
    } catch (error) {
      console.log("❌ [IngredientForm] Exception caught:", error);
      Toast.show({
        type: "error",
        text1: ingredient ? "Update failed" : "Create failed",
        text2: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 items-center justify-center bg-black/50 p-6">
      <ScrollView className="max-h-[80%] w-full max-w-md">
        <View className="rounded-lg bg-white p-6 dark:bg-gray-800">
          <Text className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            {ingredient ? "Edit Ingredient" : "Add Ingredient"}
          </Text>

          {/* Name */}
          <Text className="mb-1 text-sm text-gray-700 dark:text-gray-300">Name *</Text>
          <TextInput
            className="mb-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={name}
            onChangeText={setName}
            placeholder="Enter ingredient name"
            placeholderTextColor="#9CA3AF"
            editable={!submitting}
          />

          {/* Category */}
          <Text className="mb-1 text-sm text-gray-700 dark:text-gray-300">Category *</Text>
          {categoriesLoading ? (
            <View className="mb-3 rounded-lg border border-gray-300 bg-gray-50 px-3 py-3 dark:border-gray-600 dark:bg-gray-700">
              <ActivityIndicator size="small" color="#FF6D00" />
            </View>
          ) : (
            <View className="mb-3">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row gap-2">
                {categories?.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id?.toString() || "")}
                    disabled={submitting}
                    className={`rounded-lg px-4 py-2 ${
                      categoryId === cat.id?.toString()
                        ? "bg-[#FF6D00]"
                        : "border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
                    }`}>
                    <Text
                      className={`text-sm ${
                        categoryId === cat.id?.toString()
                          ? "font-semibold text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {!categoryId && (
                <Text className="mt-1 text-xs text-red-500">Please select a category</Text>
              )}
            </View>
          )}

          {/* Quantity */}
          <Text className="mb-1 text-sm text-gray-700 dark:text-gray-300">Quantity</Text>
          <TextInput
            className="mb-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Enter quantity"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            editable={!submitting}
          />

          {/* Unit */}
          <Text className="mb-1 text-sm text-gray-700 dark:text-gray-300">Unit *</Text>
          <View className="mb-3 flex-row flex-wrap gap-2">
            {["GRAM", "KILOGRAM", "LITER", "PCS"].map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setUnit(u as any)}
                disabled={submitting}
                style={{
                  backgroundColor: unit === u ? "#FF6D00" : "#F3F4F6",
                  padding: 8,
                  borderRadius: 8,
                }}>
                <Text style={{ color: unit === u ? "white" : "#374151" }}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Per Unit */}
          <Text className="mb-1 text-sm text-gray-700 dark:text-gray-300">Price Per Unit</Text>
          <TextInput
            className="mb-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={pricePerUnit}
            onChangeText={setPricePerUnit}
            placeholder="Enter price per unit"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            editable={!submitting}
          />

          {/* Active Status */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-sm text-gray-700 dark:text-gray-300">Active</Text>
            <TouchableOpacity
              onPress={() => setActive(!active)}
              disabled={submitting}
              className={`h-8 w-14 rounded-full ${active ? "bg-green-500" : "bg-gray-300"}`}>
              <View className={`mt-1 h-6 w-6 rounded-full bg-white ${active ? "ml-7" : "ml-1"}`} />
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View className="flex-row gap-3">
            <Button
              onPress={onClose}
              variant="outline"
              className="flex-1 border-gray-300"
              disabled={submitting}>
              <Text className="text-gray-700">Cancel</Text>
            </Button>

            <Button onPress={handleSubmit} className="flex-1 bg-[#FF6D00]" disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white">{ingredient ? "Update" : "Create"}</Text>
              )}
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
