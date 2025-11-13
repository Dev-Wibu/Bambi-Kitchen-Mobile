import { Filter, type FilterCriteria } from "@/components/Filter";
import ReloadButton from "@/components/ReloadButton";
import { SearchBar } from "@/components/SearchBar";
import { SortButton } from "@/components/SortButton";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { getPageInfo, usePagination } from "@/hooks/usePagination";
import { useSortable } from "@/hooks/useSortable";
import {
  useAllDishes,
  useToggleDishActiveWithToast,
  useToggleDishPublicWithToast,
} from "@/services/dishService";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DishForm from "./DishForm";

export default function DishesManager() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria[]>([]);
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined); // All, Active, Inactive
  const [pageSize, setPageSize] = useState(50);

  // Use /api/dish/get-all for admin - includes inactive and private dishes
  const { data, isLoading, refetch, isError } = useAllDishes();
  const togglePublicMutation = useToggleDishPublicWithToast();
  const toggleActiveMutation = useToggleDishActiveWithToast();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<any | null>(null);

  const openModal = (dish?: any) => {
    setSelectedDish(dish || null);
    setModalVisible(true);
  };

  // Reverse the list to show newest first
  const reversedDishes = useMemo(() => {
    return data ? [...data].reverse() : [];
  }, [data]);

  // Filter and search
  const filteredDishes = useMemo(() => {
    let filtered = reversedDishes;

    // Apply search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dish: any) =>
          dish.name?.toLowerCase().includes(lowerSearch) ||
          dish.description?.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply filters
    filterCriteria.forEach((filter) => {
      if (filter.field === "public" && typeof filter.value === "string") {
        filtered = filtered.filter((dish: any) => dish.public === (filter.value === "true"));
      }
      if (filter.field === "price" && typeof filter.value === "object") {
        const range = filter.value as { from: number | undefined; to: number | undefined };
        filtered = filtered.filter((dish: any) => {
          const price = dish.price || 0;
          if (range.from !== undefined && price < range.from) return false;
          if (range.to !== undefined && price > range.to) return false;
          return true;
        });
      }
    });

    // Apply status filter (separate from filterCriteria)
    if (statusFilter !== undefined) {
      filtered = filtered.filter((dish: any) => dish.active === statusFilter);
    }

    return filtered;
  }, [reversedDishes, searchTerm, filterCriteria, statusFilter]);

  // Sorting
  const { sortedData, getSortProps } = useSortable<any>(filteredDishes);

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
  }, [searchTerm, filterCriteria, statusFilter]);

  // Filter options
  const filterOptions = useMemo(
    () => [
      {
        label: "Visibility",
        value: "public",
        type: "select" as const,
        selectOptions: [
          { value: "true", label: "Public" },
          { value: "false", label: "Private" },
        ],
      },
      {
        label: "Price",
        value: "price",
        type: "numberRange" as const,
        numberRangeConfig: {
          fromPlaceholder: "Min price",
          toPlaceholder: "Max price",
          min: 0,
          step: 1000,
        },
      },
    ],
    []
  );

  // Search options
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <View className="flex-1 flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="mr-2">
              <MaterialIcons name="arrow-back" size={24} color="#FF6D00" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-[#FF6D00]">Dishes</Text>
          </View>
          <View className="flex-row gap-2">
            <ReloadButton onRefresh={() => refetch()} />
            <TouchableOpacity
              onPress={() => {
                setSelectedDish(null);
                setModalVisible(true);
              }}
              style={{ backgroundColor: "#FF6D00", borderRadius: 24, padding: 8 }}>
              <MaterialIcons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Search and Filter */}
        <View className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
          <SearchBar
            searchOptions={[]}
            onSearchChange={setSearchTerm}
            placeholder="Search dishes..."
            limitedFields={false}
            resetPagination={() => pagination.setPage(1)}
          />
          <View className="mt-2">
            <Filter filterOptions={filterOptions} onFilterChange={setFilterCriteria} />
          </View>
        </View>

        {/* Sort Controls */}
        <View className="border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Sort by:</Text>
              <SortButton {...getSortProps("name")} label="Name" />
              <SortButton {...getSortProps("price")} label="Price" />
            </View>

            {/* Status Filter Toggle */}
            <View className="flex-row items-center gap-2">
              <View className="flex-row rounded-lg border border-gray-300 dark:border-gray-600">
                <TouchableOpacity
                  onPress={() => setStatusFilter(true)}
                  className={`border-x border-gray-300 px-3 py-1 dark:border-gray-600 ${
                    statusFilter === true ? "bg-green-500" : "bg-transparent"
                  }`}>
                  <Text
                    className={`text-xs font-medium ${
                      statusFilter === true ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}>
                    Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStatusFilter(false)}
                  className={`rounded-r-lg px-3 py-1 ${
                    statusFilter === false ? "bg-red-500" : "bg-transparent"
                  }`}>
                  <Text
                    className={`text-xs font-medium ${
                      statusFilter === false ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}>
                    Inactive
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#FF6D00" style={{ marginTop: 32 }} />
        ) : isError ? (
          <Text className="mt-8 text-center text-red-500">Failed to load dishes</Text>
        ) : (
          <View className="flex-1">
            <FlatList
              data={currentPageData}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
              ListEmptyComponent={
                <Text className="mt-8 text-center text-gray-400">No dishes found.</Text>
              }
              renderItem={({ item }) => (
                <View className="mb-3 flex-row items-center rounded-lg border border-gray-200 bg-white p-3 dark:bg-gray-800">
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: 56, height: 56, borderRadius: 8, marginRight: 12 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        marginRight: 12,
                        backgroundColor: "#eee",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      <MaterialIcons name="restaurant-menu" size={28} color="#FF6D00" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text className="text-lg font-bold" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-gray-700 dark:text-gray-300" numberOfLines={1}>
                      Price: {item.price}
                    </Text>
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {item.public ? "Public" : "Private"} | {item.active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => openModal(item)} style={{ marginLeft: 8 }}>
                    <MaterialIcons name="edit" size={22} color="#FF6D00" />
                  </TouchableOpacity>
                </View>
              )}
            />

            {/* Pagination Controls */}
            {sortedData.length > 0 && (
              <View className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
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
          </View>
        )}

        <DishForm
          visible={modalVisible}
          dish={selectedDish}
          onClose={() => setModalVisible(false)}
          onSuccess={() => refetch()}
        />
      </View>
    </SafeAreaView>
  );
}
