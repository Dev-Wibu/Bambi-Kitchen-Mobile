import { Filter, type FilterCriteria } from "@/components/Filter";

import ReloadButton from "@/components/ReloadButton";

import { SearchBar } from "@/components/SearchBar";

import { SortButton } from "@/components/SortButton";

import { Button } from "@/components/ui/button";

import { Text } from "@/components/ui/text";

import { getPageInfo, usePagination } from "@/hooks/usePagination";

import { useSortable } from "@/hooks/useSortable";

import { useOrders } from "@/services/orderService";

import { MaterialIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import React, { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

type OrderStatus = "PENDING" | "COMPLETED" | "PAID" | "CANCELLED";

export default function OrdersManager() {
  const router = useRouter();

  const { data, isLoading, refetch, isError } = useOrders();

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria[]>([]);

  const [pageSize, setPageSize] = useState(10);

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);

    setModalVisible(true);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "#FFA500";

      case "COMPLETED":
        return "#4CAF50";

      case "PAID":
        return "#2196F3";

      case "CANCELLED":
        return "#F44336";

      default:
        return "#757575";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "Pending";

      case "COMPLETED":
        return "Completed";

      case "PAID":
        return "Paid";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status;
    }
  };

  // Reverse the list to show newest first

  const reversedOrders = useMemo(() => {
    return data ? [...data].reverse() : [];
  }, [data]);

  // Filter and search

  const filteredOrders = useMemo(() => {
    let filtered = reversedOrders;

    // Apply search

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (order: any) =>
          order.id?.toString().includes(searchTerm) ||
          order.userId?.toString().includes(searchTerm) ||
          order.staffId?.toString().includes(searchTerm) ||
          order.note?.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply filters

    filterCriteria.forEach((filter) => {
      if (filter.field === "status" && typeof filter.value === "string") {
        filtered = filtered.filter((order: any) => order.status === filter.value);
      }

      if (filter.field === "totalPrice" && typeof filter.value === "object") {
        const range = filter.value as { from: number | undefined; to: number | undefined };

        filtered = filtered.filter((order: any) => {
          const price = order.totalPrice || 0;

          if (range.from !== undefined && price < range.from) return false;

          if (range.to !== undefined && price > range.to) return false;

          return true;
        });
      }

      if (filter.field === "ranking" && typeof filter.value === "object") {
        const range = filter.value as { from: number | undefined; to: number | undefined };

        filtered = filtered.filter((order: any) => {
          const ranking = order.ranking || 0;

          if (range.from !== undefined && ranking < range.from) return false;

          if (range.to !== undefined && ranking > range.to) return false;

          return true;
        });
      }
    });

    return filtered;
  }, [reversedOrders, searchTerm, filterCriteria]);

  // Sorting

  const { sortedData, getSortProps } = useSortable<any>(filteredOrders);

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

  const filterOptions = useMemo(
    () => [
      {
        label: "Status",

        value: "status",

        type: "select" as const,

        selectOptions: [
          { value: "PENDING", label: "Pending" },

          { value: "COMPLETED", label: "Completed" },

          { value: "PAID", label: "Paid" },

          { value: "CANCELLED", label: "Cancelled" },
        ],
      },

      {
        label: "Total Price",

        value: "totalPrice",

        type: "numberRange" as const,

        numberRangeConfig: {
          fromPlaceholder: "Min price",

          toPlaceholder: "Max price",

          min: 0,

          step: 1000,

          suffix: "$",
        },
      },

      {
        label: "Rating",

        value: "ranking",

        type: "numberRange" as const,

        numberRangeConfig: {
          fromPlaceholder: "Min rating",

          toPlaceholder: "Max rating",

          min: 0,

          max: 5,

          step: 1,
        },
      },
    ],

    []
  );

  // Search options

  const searchOptions = useMemo(
    () => [
      { value: "id", label: "Order ID" },

      { value: "userId", label: "Customer ID" },

      { value: "staffId", label: "Staff ID" },

      { value: "note", label: "Note" },
    ],

    []
  );

  const renderOrderItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => openOrderDetails(item)}
      style={{
        backgroundColor: "white",

        borderRadius: 12,

        padding: 16,

        marginBottom: 12,

        shadowColor: "#000",

        shadowOffset: { width: 0, height: 2 },

        shadowOpacity: 0.1,

        shadowRadius: 4,

        elevation: 3,
      }}>
      <View className="mb-2 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-lg font-bold">Order #{item.id}</Text>

          <Text className="mt-1 text-sm text-gray-600">
            {item.createAt
              ? new Date(item.createAt).toLocaleDateString("en-US", {
                  year: "numeric",

                  month: "long",

                  day: "numeric",

                  hour: "2-digit",

                  minute: "2-digit",
                })
              : "N/A"}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: getStatusColor(item.status),

            paddingHorizontal: 12,

            paddingVertical: 6,

            borderRadius: 16,
          }}>
          <Text className="text-xs font-semibold text-white">{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View className="mt-2 border-t border-gray-200 pt-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Customer ID:</Text>

          <Text className="font-semibold">#{item.userId}</Text>
        </View>

        {!!item.staffId && (
          <View className="mt-1 flex-row justify-between">
            <Text className="text-gray-600">Staff ID:</Text>

            <Text className="font-semibold">#{item.staffId}</Text>
          </View>
        )}

        <View className="mt-1 flex-row justify-between">
          <Text className="text-gray-600">Total:</Text>

          <Text className="font-bold text-[#FF6D00]">
            ${item.totalPrice?.toLocaleString("en-US")}
          </Text>
        </View>

        {!!item.ranking && (
          <View className="mt-1 flex-row justify-between">
            <Text className="text-gray-600">Rating:</Text>

            <Text className="font-semibold">⭐ {item.ranking}/5</Text>
          </View>
        )}
      </View>

      {!!item.note && (
        <View className="mt-2 rounded-lg bg-gray-100 p-2">
          <Text className="text-sm text-gray-700">{item.note}</Text>
        </View>
      )}
    </Pressable>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF6D00" />

        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <MaterialIcons name="error-outline" size={64} color="#F44336" />

        <Text className="mt-4 text-xl font-bold text-gray-800">Data Loading Error</Text>

        <Text className="mt-2 text-center text-gray-600">Unable to load orders list</Text>

        <TouchableOpacity
          onPress={() => refetch()}
          style={{
            backgroundColor: "#FF6D00",

            paddingHorizontal: 24,

            paddingVertical: 12,

            borderRadius: 24,

            marginTop: 16,
          }}>
          <Text className="font-semibold text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}

      <View
        className="bg-white px-6 pb-6 pt-12"
        style={{
          borderBottomWidth: 1,

          borderBottomColor: "#E0E0E0",
        }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="mr-2">
              <MaterialIcons name="arrow-back" size={24} color="#FF6D00" />
            </TouchableOpacity>

            <View className="flex-1">
              <Text className="text-2xl font-bold">Order Management</Text>

              <Text className="mt-1 text-sm text-gray-600">Total: {sortedData.length} orders</Text>
            </View>
          </View>

          <ReloadButton onRefresh={() => refetch()} />
        </View>

        {/* Search and Filter */}

        <View className="mt-4 gap-3">
          <SearchBar
            searchOptions={[]}
            onSearchChange={setSearchTerm}
            placeholder="Search by order ID, customer ID, staff ID, or note..."
            limitedFields={false}
            resetPagination={pagination.reset}
          />

          <Filter
            filterOptions={filterOptions}
            onFilterChange={(criteria) => {
              setFilterCriteria(criteria);

              pagination.setPage(1);
            }}
          />
        </View>

        {/* Table Header with Sort */}

        <View className="mt-4 flex-row items-center border-b border-gray-200 pb-2">
          <View className="flex-1">
            <SortButton {...getSortProps("id")} label="Order #" />
          </View>

          <View className="flex-1">
            <SortButton {...getSortProps("status")} label="Status" />
          </View>

          <View className="flex-1">
            <SortButton {...getSortProps("totalPrice")} label="Total" />
          </View>

          <View className="flex-1">
            <SortButton {...getSortProps("createAt")} label="Date" />
          </View>
        </View>
      </View>

      {/* List */}

      <View className="flex-1 p-4">
        {currentPageData.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="receipt-long" size={64} color="#9CA3AF" />

            <Text className="mt-4 text-center text-gray-500">
              {searchTerm || filterCriteria.length > 0
                ? "No orders found matching your criteria"
                : "No orders available"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={currentPageData}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderOrderItem}
            ListFooterComponent={
              <View className="mt-4 flex-row items-center justify-between border-t border-gray-200 bg-white p-4">
                <Text className="text-sm text-gray-600">{getPageInfo(pagination)}</Text>

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

      {/* Order Details Modal */}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[80%] rounded-t-3xl bg-white p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold">Order Details #{selectedOrder?.id}</Text>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Order Info */}

              <View className="mb-4">
                <Text className="mb-2 text-gray-600">Order Information</Text>

                <View className="space-y-2 rounded-lg bg-gray-50 p-4">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-700">Created Date:</Text>

                    <Text className="font-semibold">
                      {selectedOrder?.createAt
                        ? new Date(selectedOrder.createAt).toLocaleDateString("en-US")
                        : "N/A"}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-gray-700">Status:</Text>

                    <Text
                      style={{
                        color: selectedOrder?.status
                          ? getStatusColor(selectedOrder.status)
                          : "#757575",

                        fontWeight: "600",
                      }}>
                      {selectedOrder?.status && getStatusText(selectedOrder.status)}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-gray-700">Total:</Text>

                    <Text className="font-bold text-[#FF6D00]">
                      ${selectedOrder?.totalPrice?.toLocaleString("en-US")}
                    </Text>
                  </View>

                  {!!selectedOrder?.ranking && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-700">Rating:</Text>

                      <Text className="font-semibold">⭐ {selectedOrder.ranking}/5</Text>
                    </View>
                  )}

                  {!!selectedOrder?.comment && (
                    <View className="mt-2">
                      <Text className="mb-1 text-gray-700">Comment:</Text>

                      <Text className="text-gray-800">{selectedOrder.comment}</Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

