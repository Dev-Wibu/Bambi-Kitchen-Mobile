import { Filter, type FilterCriteria } from "@/components/Filter";
import ReloadButton from "@/components/ReloadButton";
import { SearchBar } from "@/components/SearchBar";
import { SortButton } from "@/components/SortButton";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { getPageInfo, usePagination } from "@/hooks/usePagination";
import { useSortable } from "@/hooks/useSortable";
import type { Ingredient } from "@/interfaces/ingredient.interface";
import { useIngredientCategories } from "@/services/ingredientCategoryService";
import { useIngredients, useToggleIngredientActiveWithToast } from "@/services/ingredientService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import IngredientForm from "./IngredientForm";

export default function IngredientManagement() {
  const router = useRouter();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria[]>([]);
  const [pageSize, setPageSize] = useState(10);

  // Query hooks
  const { data: ingredients, isLoading, refetch } = useIngredients();
  const { data: categories, isLoading: categoriesLoading } = useIngredientCategories();
  const toggleActiveMutation = useToggleIngredientActiveWithToast();
  const queryClient = useQueryClient();

  console.log("🔍 [Ingredients] Component state:", {
    totalIngredients: ingredients?.length || 0,
    isLoading,
    isFormVisible,
    hasSelectedIngredient: !!selectedIngredient,
    searchTerm,
  });

  // Reverse the list to show newest first
  const reversedIngredients = useMemo(() => {
    return ingredients ? [...ingredients].reverse() : [];
  }, [ingredients]);

  // Filter and search
  const filteredIngredients = useMemo(() => {
    let filtered = reversedIngredients;

    // Apply search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ingredient) =>
          ingredient.name?.toLowerCase().includes(lowerSearch) ||
          ingredient.category?.name?.toLowerCase().includes(lowerSearch) ||
          ingredient.unit?.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply filters
    filterCriteria.forEach((filter) => {
      if (filter.field === "category" && typeof filter.value === "string") {
        filtered = filtered.filter(
          (ingredient) => ingredient.category?.id?.toString() === filter.value
        );
      }
      if (filter.field === "active" && typeof filter.value === "string") {
        filtered = filtered.filter((ingredient) => ingredient.active === (filter.value === "true"));
      }
      if (filter.field === "quantity" && typeof filter.value === "object") {
        const range = filter.value as { from: number | undefined; to: number | undefined };
        filtered = filtered.filter((ingredient) => {
          const qty = ingredient.quantity || 0;
          if (range.from !== undefined && qty < range.from) return false;
          if (range.to !== undefined && qty > range.to) return false;
          return true;
        });
      }
    });

    return filtered;
  }, [reversedIngredients, searchTerm, filterCriteria]);

  // Sorting
  const { sortedData, getSortProps } = useSortable<Ingredient>(filteredIngredients);

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

  // Filter options
  const filterOptions = useMemo(() => {
    const categoryOptions =
      categories?.map((cat) => ({
        value: cat.id?.toString() || "",
        label: cat.name || "",
      })) || [];

    return [
      {
        label: "Category",
        value: "category",
        type: "select" as const,
        selectOptions: categoryOptions,
      },
      {
        label: "Status",
        value: "active",
        type: "select" as const,
        selectOptions: [
          { value: "true", label: "Active" },
          { value: "false", label: "Inactive" },
        ],
      },
      {
        label: "Quantity",
        value: "quantity",
        type: "numberRange" as const,
        numberRangeConfig: {
          fromPlaceholder: "Min quantity",
          toPlaceholder: "Max quantity",
          min: 0,
          step: 1,
        },
      },
    ];
  }, [categories]);

  // Search options
  const searchOptions = useMemo(
    () => [
      { value: "name", label: "Name" },
      { value: "category", label: "Category" },
      { value: "unit", label: "Unit" },
    ],
    []
  );

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

  const handleToggleActive = (ingredient: Ingredient) => {
    console.log("🔄 [Ingredients] Opening toggle confirmation for:", {
      id: ingredient.id,
      name: ingredient.name,
      currentStatus: ingredient.active,
    });
    setToggleConfirm(ingredient);
  };

  const handleFormSuccess = () => {
    console.log("✅ [Ingredients] Form submitted successfully, refreshing list");
    setIsFormVisible(false);
    refetch();
  };

  const confirmToggleActive = async () => {
    if (!toggleConfirm?.id) return;

    console.log("🔄 [Ingredients] Confirming toggle for:", {
      id: toggleConfirm.id,
      name: toggleConfirm.name,
      currentStatus: toggleConfirm.active,
    });

    try {
      console.log("📤 [Ingredients] Calling toggle mutation");
      await toggleActiveMutation.mutateAsync({
        params: { path: { id: toggleConfirm.id! } },
      });

      console.log("✅ [Ingredients] Toggle successful");

      Toast.show({
        type: "success",

        text1: "Success",

        text2: `Ingredient ${toggleConfirm.active ? "deactivated" : "activated"} successfully`,
      });

      console.log("🔄 [Ingredients] Invalidating queries and refetching");
      queryClient.invalidateQueries({ queryKey: ["/api/ingredient"] });
      refetch();
      setToggleConfirm(null);
      console.log("✅ [Ingredients] Toggle confirmation closed, list refreshed");
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

  console.log("🔍 [Ingredients] Search results:", {
    searchTerm,
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

        {/* Search and Filter */}
        <SearchBar
          searchOptions={searchOptions}
          onSearchChange={setSearchTerm}
          placeholder="Search ingredients..."
          resetPagination={() => pagination.setPage(1)}
        />
        <View className="mt-2">
          <Filter filterOptions={filterOptions} onFilterChange={setFilterCriteria} />
        </View>
      </View>

      {/* Sort Controls */}
      <View className="border-b border-gray-200 bg-white px-6 py-2 dark:border-gray-700 dark:bg-gray-900">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Sort by:</Text>
          <SortButton {...getSortProps("name")} label="Name" />
          <SortButton {...getSortProps("quantity")} label="Quantity" />
          <SortButton {...getSortProps("active")} label="Status" />
        </View>
      </View>

      {/* Ingredient List */}

      <View className="flex-1">
        <FlatList
          data={currentPageData}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerClassName="px-6 py-4"
          ListEmptyComponent={
            <View className="items-center py-8">
              <MaterialIcons name="inventory" size={48} color="#D1D5DB" />
              <Text className="mt-2 text-gray-500 dark:text-gray-400">No ingredients found</Text>
            </View>
          }
          renderItem={({ item: ingredient }) => (
            <View className="mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                  onPress={() => handleEdit(ingredient)}
                  className="flex-1 rounded-lg bg-[#FF6D00] py-2">
                  <Text className="text-center text-sm font-medium text-white">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleToggleActive(ingredient)}
                  className={`flex-1 rounded-lg py-2 ${ingredient.active ? "bg-orange-500" : "bg-green-500"}`}>
                  <Text className="text-center text-sm font-medium text-white">
                    {ingredient.active ? "Deactivate" : "Activate"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/* Pagination Controls */}
      {sortedData.length > 0 && (
        <View className="border-t border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              {getPageInfo(pagination)}
            </Text>
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onPress={() => pagination.prevPage()}
                disabled={!pagination.hasPrevPage}>
                <Text>Previous</Text>
              </Button>
              <Text className="px-3 py-2 text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => pagination.nextPage()}
                disabled={!pagination.hasNextPage}>
                <Text>Next</Text>
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* Toggle Active Status Confirmation Modal */}
      {toggleConfirm && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <View className="mx-6 rounded-lg bg-white p-6 dark:bg-gray-800">
            <Text className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {toggleConfirm.active ? "Deactivate" : "Activate"} Ingredient
            </Text>
            <Text className="mb-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to {toggleConfirm.active ? "deactivate" : "activate"} "
              {toggleConfirm.name}"?
            </Text>
            <View className="flex-row gap-3">
              <Button
                onPress={() => setToggleConfirm(null)}
                variant="outline"
                className="flex-1 border-gray-300">
                <Text className="text-gray-700">Cancel</Text>
              </Button>
              <Button
                onPress={confirmToggleActive}
                className={`flex-1 ${toggleConfirm.active ? "bg-orange-500" : "bg-green-500"}`}>
                <Text className="text-white">
                  {toggleConfirm.active ? "Deactivate" : "Activate"}
                </Text>
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
