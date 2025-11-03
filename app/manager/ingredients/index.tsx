import { Button } from "@/components/ui/button";

import { Text } from "@/components/ui/text";

import type { Ingredient } from "@/interfaces/ingredient.interface";

import {
  useCreateIngredient,
  useDeleteIngredient,
  useIngredients,
  useToggleIngredientActive,
  useUpdateIngredient,
} from "@/services/ingredientService";

import { MaterialIcons } from "@expo/vector-icons";

import { useQueryClient } from "@tanstack/react-query";

import { useRouter } from "expo-router";

import { useState } from "react";

import { ActivityIndicator, ScrollView, TextInput, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

export default function IngredientManagement() {
  const router = useRouter();
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<Ingredient | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  
  // Form fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<"GRAM" | "KILOGRAM" | "LITER" | "PCS">("GRAM");
  const [pricePerUnit, setPricePerUnit] = useState("");

  const queryClient = useQueryClient();

  // Query hooks - 5 endpoints used here

  const { data: ingredients, isLoading, refetch } = useIngredients();

  const createMutation = useCreateIngredient();

  const updateMutation = useUpdateIngredient();

  const deleteMutation = useDeleteIngredient();

  const toggleActiveMutation = useToggleIngredientActive();

  const handleAdd = () => {
    setSelectedIngredient(null);
    setName("");
    setCategoryId("");
    setQuantity("");
    setUnit("GRAM");
    setPricePerUnit("");
    setIsFormVisible(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setName(ingredient.name || "");
    setCategoryId(ingredient.category?.id?.toString() || "");
    setQuantity(ingredient.quantity?.toString() || "");
    setUnit(ingredient.unit || "GRAM");
    setPricePerUnit(ingredient.pricePerUnit?.toString() || "");
    setIsFormVisible(true);
  };

  const handleDelete = (ingredient: Ingredient) => {
    setDeleteConfirm(ingredient);
  };
  
  const handleSubmitForm = async () => {
    if (!name.trim()) {
      Toast.show({ type: "error", text1: "Name is required" });
      return;
    }
    if (!categoryId) {
      Toast.show({ type: "error", text1: "Category is required" });
      return;
    }
    
    try {
      const ingredientData: any = {
        name: name.trim(),
        categoryId: parseInt(categoryId),
        quantity: quantity ? parseFloat(quantity) : 0,
        unit,
        pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : 0,
      };
      
      if (selectedIngredient?.id) {
        // Update
        ingredientData.id = selectedIngredient.id;
        await updateMutation.mutateAsync({ body: ingredientData });
        Toast.show({ type: "success", text1: "Ingredient updated successfully" });
      } else {
        // Create
        await createMutation.mutateAsync({ body: ingredientData });
        Toast.show({ type: "success", text1: "Ingredient created successfully" });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/ingredient"] });
      refetch(); // Reload the list
      setIsFormVisible(false);
    } catch (error) {
      Toast.show({ 
        type: "error", 
        text1: selectedIngredient ? "Update failed" : "Create failed",
        text2: error instanceof Error ? error.message : "Please try again"
      });
    }
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

        text2: "Ingredient deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/ingredient"] });
      refetch(); // Reload the list after delete
      setDeleteConfirm(null);
    } catch (error) {
      Toast.show({
        type: "error",

        text1: "Error",

        text2: "Failed to delete ingredient",
      });
    }
  };

  const handleToggleActive = async (ingredient: Ingredient) => {
    try {
      await toggleActiveMutation.mutateAsync({
        params: { path: { id: ingredient.id! } },
      });

      Toast.show({
        type: "success",

        text1: "Success",

        text2: `Ingredient ${ingredient.active ? "deactivated" : "activated"}`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/ingredient"] });
      refetch(); // Reload the list after toggle
    } catch (error) {
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

  if (isLoading) {
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
          <View className="flex-row items-center gap-3 flex-1">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-2">
              <MaterialIcons name="arrow-back" size={24} color="#FF6D00" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Ingredients Management
            </Text>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => refetch()}
              style={{ backgroundColor: "#F3F4F6", borderRadius: 8, padding: 8 }}>
              <MaterialIcons name="refresh" size={24} color="#FF6D00" />
            </TouchableOpacity>
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

      {isFormVisible && (
        <View className="absolute inset-0 items-center justify-center bg-black/50 p-6">
          <ScrollView className="max-h-[80%] w-full max-w-md">
            <View className="rounded-lg bg-white p-6 dark:bg-gray-800">
              <Text className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                {selectedIngredient ? "Edit Ingredient" : "Add Ingredient"}
              </Text>

              {/* Name */}
              <Text className="mb-1 text-sm text-gray-700 dark:text-gray-300">Name *</Text>
              <TextInput
                className="mb-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={name}
                onChangeText={setName}
                placeholder="Enter ingredient name"
                placeholderTextColor="#9CA3AF"
              />

              {/* Category ID */}
              <Text className="mb-1 text-sm text-gray-700 dark:text-gray-300">Category ID *</Text>
              <TextInput
                className="mb-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={categoryId}
                onChangeText={setCategoryId}
                placeholder="Enter category ID"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />

              {/* Quantity */}
              <Text className="mb-1 text-sm text-gray-700 dark:text-gray-300">Quantity</Text>
              <TextInput
                className="mb-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Enter quantity"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />

              {/* Unit */}
              <Text className="mb-1 text-sm text-gray-700 dark:text-gray-300">Unit *</Text>
              <View className="mb-3 flex-row flex-wrap gap-2">
                {["GRAM", "KILOGRAM", "LITER", "PCS"].map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setUnit(u as any)}
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
                className="mb-4 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={pricePerUnit}
                onChangeText={setPricePerUnit}
                placeholder="Enter price per unit"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />

              {/* Buttons */}
              <View className="flex-row gap-3">
                <Button
                  onPress={() => setIsFormVisible(false)}
                  variant="outline"
                  className="flex-1 border-gray-300">
                  <Text className="text-gray-700">Cancel</Text>
                </Button>

                <Button 
                  onPress={handleSubmitForm} 
                  className="flex-1 bg-[#FF6D00]"
                  disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white">{selectedIngredient ? "Update" : "Create"}</Text>
                  )}
                </Button>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
