import ReloadButton from "@/components/ReloadButton";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { Ingredient } from "@/interfaces/ingredient.interface";
import { useIngredientCategories } from "@/services/ingredientCategoryService";
import {
  useDeleteIngredientWithToast,
  useIngredients,
  useToggleIngredientActiveWithToast,
} from "@/services/ingredientService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import IngredientForm from "./IngredientForm";

export default function IngredientManagement() {
  const router = useRouter();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Ingredient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Query hooks
  const { data: ingredients, isLoading, refetch } = useIngredients();
  const { data: categories, isLoading: categoriesLoading } = useIngredientCategories();
  const deleteMutation = useDeleteIngredientWithToast();
  const toggleActiveMutation = useToggleIngredientActiveWithToast();
  const queryClient = useQueryClient();

  console.log("🔍 [Ingredients] Component state:", {
    totalIngredients: ingredients?.length || 0,
    isLoading,
    isFormVisible,
    hasSelectedIngredient: !!selectedIngredient,
    searchQuery,
  });

  const handleAdd = () => {
    console.log("📝 [Ingredients] Opening add form");
    setSelectedIngredient(null);
    setIsFormVisible(true);
    console.log("✅ [Ingredients] Add form opened successfully");
  };

  const handleEdit = (ingredient: Ingredient) => {
    console.log("✏️ [Ingredients] Opening edit form for:", {
      id: ingredient.id,
      name: ingredient.name,
      category: ingredient.category?.name,
    });
    setSelectedIngredient(ingredient);
    setIsFormVisible(true);
    console.log("✅ [Ingredients] Edit form opened");
  };

  const handleDelete = (ingredient: Ingredient) => {
    console.log("🗑️ [Ingredients] Opening delete confirmation for:", {
      id: ingredient.id,
      name: ingredient.name,
    });
    setDeleteConfirm(ingredient);
  };

  const handleFormSuccess = () => {
    console.log("✅ [Ingredients] Form submitted successfully, refreshing list");
    setIsFormVisible(false);
    refetch();
  };

  const confirmDelete = async () => {
    if (!deleteConfirm?.id) return;

    console.log("🗑️ [Ingredients] Confirming delete for:", {
      id: deleteConfirm.id,
      name: deleteConfirm.name,
    });

    try {
      console.log("📤 [Ingredients] Calling delete mutation");
      await deleteMutation.mutateAsync({
        params: { path: { id: deleteConfirm.id } },
      });

      console.log("✅ [Ingredients] Delete successful");

      Toast.show({
        type: "success",

        text1: "Success",

        text2: "Ingredient deleted successfully",
      });

      console.log("🔄 [Ingredients] Invalidating queries and refetching");
      queryClient.invalidateQueries({ queryKey: ["/api/ingredient"] });
      refetch(); // Reload the list after delete
      setDeleteConfirm(null);
      console.log("✅ [Ingredients] Delete confirmation closed, list refreshed");
    } catch (error) {
      console.log("❌ [Ingredients] Delete failed:", error);
      Toast.show({
        type: "error",

        text1: "Error",

        text2: "Failed to delete ingredient",
      });
    }
  };

  const handleToggleActive = async (ingredient: Ingredient) => {
    console.log("🔄 [Ingredients] Toggling active status:", {
      id: ingredient.id,
      name: ingredient.name,
      currentStatus: ingredient.active,
      newStatus: !ingredient.active,
    });

    try {
      console.log("📤 [Ingredients] Calling toggle mutation");
      await toggleActiveMutation.mutateAsync({
        params: { path: { id: ingredient.id! } },
      });

      console.log("✅ [Ingredients] Toggle successful");

      Toast.show({
        type: "success",

        text1: "Success",

        text2: `Ingredient ${ingredient.active ? "deactivated" : "activated"}`,
      });

      console.log("🔄 [Ingredients] Invalidating queries and refetching");
      queryClient.invalidateQueries({ queryKey: ["/api/ingredient"] });
      refetch(); // Reload the list after toggle
      console.log("✅ [Ingredients] List refreshed after toggle");
    } catch (error) {
      console.log("❌ [Ingredients] Toggle failed:", error);
      Toast.show({
        type: "error",

        text1: "Error",

        text2: "Failed to toggle ingredient status",
      });
    }
  };

  // Filter ingredients based on search

  const filteredIngredients = ingredients?.filter((ingredient) =>
    ingredient.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log("🔍 [Ingredients] Search results:", {
    searchQuery,
    totalIngredients: ingredients?.length || 0,
    filteredCount: filteredIngredients?.length || 0,
  });

  if (isLoading) {
    console.log("⏳ [Ingredients] Loading ingredients...");
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FF6D00" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}

      <View className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="mr-2">
              <MaterialIcons name="arrow-back" size={24} color="#FF6D00" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Ingredients Management
            </Text>
          </View>

          <View className="flex-row gap-2">
            <ReloadButton onRefresh={() => refetch()} size={24} borderRadius={8} />
            <Button onPress={handleAdd} className="bg-[#FF6D00]">
              <MaterialIcons name="add" size={20} color="white" />
              <Text className="ml-2 font-semibold text-white">Add</Text>
            </Button>
          </View>
        </View>

        {/* Search */}

        <View className="flex-row items-center rounded-lg border border-gray-300 bg-gray-50 px-3 dark:border-gray-600 dark:bg-gray-800">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />

          <TextInput
            className="flex-1 py-2 pl-2 text-gray-900 dark:text-white"
            placeholder="Search ingredients..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Ingredient List */}

      <ScrollView className="flex-1 px-6 py-4">
        {filteredIngredients && filteredIngredients.length > 0 ? (
          filteredIngredients.map((ingredient) => (
            <View
              key={ingredient.id}
              className="mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <View className="mb-2 flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    {ingredient.name}
                  </Text>

                  {ingredient.category && (
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      Category: {ingredient.category.name}
                    </Text>
                  )}

                  <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Stock: {ingredient.quantity || 0} {ingredient.unit}
                  </Text>

                  <View className="mt-1 flex-row items-center gap-2">
                    <View
                      className={`rounded-full px-2 py-1 ${ingredient.active ? "bg-green-100" : "bg-red-100"}`}>
                      <Text
                        className={`text-xs font-medium ${ingredient.active ? "text-green-800" : "text-red-800"}`}>
                        {ingredient.active ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Actions */}

              <View className="mt-3 flex-row gap-2">
                <TouchableOpacity
                  onPress={() => handleToggleActive(ingredient)}
                  className="flex-1 rounded-lg bg-blue-500 py-2">
                  <Text className="text-center text-sm font-medium text-white">
                    {ingredient.active ? "Deactivate" : "Activate"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleEdit(ingredient)}
                  className="flex-1 rounded-lg bg-[#FF6D00] py-2">
                  <Text className="text-center text-sm font-medium text-white">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(ingredient)}
                  className="flex-1 rounded-lg bg-red-500 py-2">
                  <Text className="text-center text-sm font-medium text-white">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center py-8">
            <MaterialIcons name="inventory" size={48} color="#D1D5DB" />

            <Text className="mt-2 text-gray-500 dark:text-gray-400">No ingredients found</Text>
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <View className="mx-6 rounded-lg bg-white p-6 dark:bg-gray-800">
            <Text className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delete Ingredient
            </Text>
            <Text className="mb-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete "{deleteConfirm.name}"?
            </Text>
            <View className="flex-row gap-3">
              <Button
                onPress={() => setDeleteConfirm(null)}
                variant="outline"
                className="flex-1 border-gray-300">
                <Text className="text-gray-700">Cancel</Text>
              </Button>
              <Button onPress={confirmDelete} className="flex-1 bg-red-500">
                <Text className="text-white">Delete</Text>
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* Form Modal */}
      <IngredientForm
        visible={isFormVisible}
        ingredient={selectedIngredient}
        categories={categories || []}
        categoriesLoading={categoriesLoading}
        onClose={() => setIsFormVisible(false)}
        onSuccess={handleFormSuccess}
      />
    </SafeAreaView>
  );
}
