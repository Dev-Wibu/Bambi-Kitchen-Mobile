import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { IngredientCategory } from "@/interfaces/ingredientCategory.interface";
import {
  transformIngredientCategoryCreateRequest,
  transformIngredientCategoryUpdateRequest,
  useCreateIngredientCategory,
  useDeleteIngredientCategory,
  useIngredientCategories,
  useUpdateIngredientCategory,
} from "@/services/ingredientCategoryService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import IngredientCategoryForm from "./IngredientCategoryForm";

export default function IngredientCategoryManagement() {
  const router = useRouter();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<IngredientCategory | null>(null);

  const queryClient = useQueryClient();

  // Query hooks
  const { data: categories, isLoading } = useIngredientCategories();
  const createMutation = useCreateIngredientCategory();
  const updateMutation = useUpdateIngredientCategory();
  const deleteMutation = useDeleteIngredientCategory();

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsFormVisible(true);
  };

  const handleEdit = (category: IngredientCategory) => {
    setSelectedCategory(category);
    setIsFormVisible(true);
  };

  const handleDelete = (category: IngredientCategory) => {
    setDeleteConfirm(category);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm?.id) return;

    try {
      await deleteMutation.mutateAsync({
        params: { path: { id: deleteConfirm.id } },
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Ingredient category deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/ingredient-categories"] });
      setDeleteConfirm(null);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete ingredient category",
      });
    }
  };

  const handleSubmit = async (data: { name: string; description?: string }) => {
    try {
      if (selectedCategory?.id) {
        // Update existing category
        const updateData = transformIngredientCategoryUpdateRequest({
          id: selectedCategory.id,
          name: data.name,
          description: data.description,
        });

        await updateMutation.mutateAsync({
          body: updateData,
        });

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Ingredient category updated successfully",
        });
      } else {
        // Create new category
        const createData = transformIngredientCategoryCreateRequest({
          name: data.name,
          description: data.description,
        });

        await createMutation.mutateAsync({
          body: createData,
        });

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Ingredient category created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/ingredient-categories"] });
      setIsFormVisible(false);
      setSelectedCategory(null);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: selectedCategory
          ? "Failed to update ingredient category"
          : "Failed to create ingredient category",
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
        <Text className="mt-4 text-base text-gray-600 dark:text-gray-300">
          Loading ingredient categories...
        </Text>
      </SafeAreaView>
    );
  }

  if (isFormVisible) {
    return (
      <IngredientCategoryForm
        category={selectedCategory}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsFormVisible(false);
          setSelectedCategory(null);
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  if (deleteConfirm) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <MaterialIcons
              name="warning"
              size={48}
              color="#FF6D00"
              style={{ alignSelf: "center" }}
            />
            <Text className="mt-4 text-center text-xl font-bold text-[#000000] dark:text-white">
              Confirm Delete
            </Text>
            <Text className="mt-2 text-center text-base text-gray-600 dark:text-gray-300">
              Are you sure you want to delete the ingredient category &quot;{deleteConfirm.name}
              &quot;?
            </Text>
            <View className="mt-6 flex-row gap-3">
              <Button
                className="flex-1 bg-gray-300 active:bg-gray-400"
                onPress={() => setDeleteConfirm(null)}>
                <Text className="font-semibold text-[#000000]">Cancel</Text>
              </Button>
              <Button
                className="flex-1 bg-red-500 active:bg-red-600"
                onPress={confirmDelete}
                disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-semibold text-white">Delete</Text>
                )}
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="mr-2">
                <MaterialIcons name="arrow-back" size={24} color="#FF6D00" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                  Ingredient Category Management
                </Text>
                <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Manage ingredient categories
                </Text>
              </View>
            </View>
            <Button className="bg-[#FF6D00] active:bg-[#FF4D00]" onPress={handleAdd}>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="font-semibold text-white">Add</Text>
              </View>
            </Button>
          </View>
        </View>

        {/* Categories List */}
        <ScrollView className="flex-1" contentContainerClassName="p-6">
          {!categories || categories.length === 0 ? (
            <View className="items-center py-12">
              <MaterialIcons name="category" size={64} color="#ccc" />
              <Text className="mt-4 text-center text-base text-gray-600 dark:text-gray-300">
                No ingredient categories found
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {categories.map((category: IngredientCategory) => (
                <TouchableOpacity
                  key={category.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                  activeOpacity={0.7}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-[#000000] dark:text-white">
                        {category.name}
                      </Text>
                      {category.description && (
                        <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {category.description}
                        </Text>
                      )}
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        className="rounded-lg bg-blue-500 p-2 active:bg-blue-600"
                        onPress={() => handleEdit(category)}>
                        <MaterialIcons name="edit" size={20} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="rounded-lg bg-red-500 p-2 active:bg-red-600"
                        onPress={() => handleDelete(category)}>
                        <MaterialIcons name="delete" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
