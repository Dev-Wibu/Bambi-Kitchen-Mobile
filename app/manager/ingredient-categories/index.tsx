import { type FilterCriteria } from "@/components/Filter";

import ReloadButton from "@/components/ReloadButton";

import { SearchBar } from "@/components/SearchBar";

import { SortButton } from "@/components/SortButton";

import { Button } from "@/components/ui/button";

import { Text } from "@/components/ui/text";

import { getPageInfo, usePagination } from "@/hooks/usePagination";

import { useSortable } from "@/hooks/useSortable";

import type { IngredientCategory } from "@/interfaces/ingredientCategory.interface";

import {
  transformIngredientCategoryCreateRequest,
  transformIngredientCategoryUpdateRequest,
  useCreateIngredientCategoryWithToast,
  useIngredientCategories,
  useUpdateIngredientCategoryWithToast,
} from "@/services/ingredientCategoryService";

import { MaterialIcons } from "@expo/vector-icons";

import { useQueryClient } from "@tanstack/react-query";

import { useRouter } from "expo-router";

import { useEffect, useMemo, useState } from "react";

import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

import IngredientCategoryForm from "./IngredientCategoryForm";

export default function IngredientCategoryManagement() {
  const router = useRouter();

  const [isFormVisible, setIsFormVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria[]>([]);

  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Query hooks

  const { data: categories, isLoading, refetch } = useIngredientCategories();

  const createMutation = useCreateIngredientCategoryWithToast();

  const updateMutation = useUpdateIngredientCategoryWithToast();

  // Reverse the list to show newest first

  const reversedCategories = useMemo(() => {
    return categories ? [...categories].reverse() : [];
  }, [categories]);

  // Filter and search

  const filteredCategories = useMemo(() => {
    let filtered = reversedCategories;

    // Apply search

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (category) =>
          category.name?.toLowerCase().includes(lowerSearch) ||
          category.description?.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }, [reversedCategories, searchTerm]);

  // Sorting

  const { sortedData, getSortProps } = useSortable<IngredientCategory>(filteredCategories);

  // Pagination

  const pagination = usePagination({
    totalCount: sortedData.length,

    pageSize,

    initialPage: 1,
  });

  // Current page data

  const currentPageData = useMemo(() => {
    return sortedData.slice(pagination.startIndex, pagination.endIndex + 1);
  }, [sortedData, pagination.startIndex, pagination.endIndex]);

  // Reset pagination when filters change

  useEffect(() => {
    pagination.setPage(1);
  }, [searchTerm, filterCriteria]);

  // Search options

  const searchOptions = useMemo(
    () => [
      { value: "name", label: "Name" },

      { value: "description", label: "Description" },
    ],

    []
  );

  const handleAdd = () => {
    setSelectedCategory(null);

    setIsFormVisible(true);
  };

  const handleEdit = (category: IngredientCategory) => {
    setSelectedCategory(category);

    setIsFormVisible(true);
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

      refetch();

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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {/* Header */}

        <View className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.back()} className="mr-2">
                <MaterialIcons name="arrow-back" size={24} color="#FF6D00" />
              </TouchableOpacity>

              <View className="flex-1">
                <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                  Ingredient Category Management
                </Text>

                <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Manage ingredient categories (edit only)
                </Text>
              </View>
            </View>

            <View className="flex-row gap-2">
              <ReloadButton onRefresh={() => refetch()} />

              <Button className="bg-[#FF6D00] active:bg-[#FF4D00]" onPress={handleAdd}>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="add" size={20} color="white" />

                  <Text className="font-semibold text-white">Add</Text>
                </View>
              </Button>
            </View>
          </View>
        </View>

        {/* Categories List */}

        <View className="flex-1 px-6 pt-4">
          {/* Search and Filter */}

          <View className="mb-4 gap-3">
            <SearchBar
              searchOptions={[]}
              onSearchChange={setSearchTerm}
              placeholder="Search by name or description..."
              limitedFields={false}
              resetPagination={pagination.reset}
            />
          </View>

          {/* Table Header with Sort */}

          <View className="mb-2 flex-row items-center border-b border-gray-200 pb-2 dark:border-gray-700">
            <View className="flex-1">
              <SortButton {...getSortProps("name")} label="Name" />
            </View>

            <View className="flex-1">
              <SortButton {...getSortProps("description")} label="Description" />
            </View>

            <View className="w-20">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Actions
              </Text>
            </View>
          </View>

          {/* Categories FlatList */}

          {isLoading ? (
            <View className="flex-1 items-center justify-center py-12">
              <ActivityIndicator size="large" color="#FF6D00" />
            </View>
          ) : currentPageData.length === 0 ? (
            <View className="items-center py-12">
              <MaterialIcons name="category" size={64} color="#ccc" />

              <Text className="mt-4 text-center text-base text-gray-600 dark:text-gray-300">
                {searchTerm
                  ? "No categories found matching your search"
                  : "No ingredient categories found"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={currentPageData}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={({ item: category }) => (
                <View className="mb-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
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
                    </View>
                  </View>
                </View>
              )}
              ListFooterComponent={
                <View className="mt-4 flex-row items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                  <Text className="text-sm text-gray-600 dark:text-gray-300">
                    {getPageInfo(pagination)}
                  </Text>

                  <View className="flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={pagination.prevPage}
                      disabled={pagination.currentPage === 1}>
                      <MaterialIcons name="chevron-left" size={20} />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onPress={pagination.nextPage}
                      disabled={pagination.currentPage === pagination.totalPages}>
                      <MaterialIcons name="chevron-right" size={20} />
                    </Button>
                  </View>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

