import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { IngredientCategory } from "@/interfaces/ingredientCategory.interface";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface IngredientCategoryFormProps {
  category: IngredientCategory | null;
  onSubmit: (data: { name: string; description?: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function IngredientCategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading,
}: IngredientCategoryFormProps) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");

  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onCancel} className="mr-4">
              <MaterialIcons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                {category ? "Edit Ingredient Category" : "Create Ingredient Category"}
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {category
                  ? "Update ingredient category information"
                  : "Add a new ingredient category"}
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <ScrollView className="flex-1" contentContainerClassName="p-6">
          {/* Name Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Name *</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Enter name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              editable={!isLoading}
            />
            {errors.name && <Text className="mt-1 text-sm text-red-500">{errors.name}</Text>}
          </View>

          {/* Description Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Description</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Enter description (optional)"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>

          {/* Buttons */}
          <View className="mt-6 gap-3">
            <Button
              className="w-full bg-[#FF6D00] active:bg-[#FF4D00]"
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-bold text-white">
                  {category ? "Update Category" : "Create Category"}
                </Text>
              )}
            </Button>
            <Button
              className="w-full bg-gray-300 active:bg-gray-400"
              onPress={onCancel}
              disabled={isLoading}>
              <Text className="text-lg font-bold text-[#000000]">Cancel</Text>
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
