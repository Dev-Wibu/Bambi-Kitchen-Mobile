import { Filter, type FilterCriteria } from "@/components/Filter";
import ReloadButton from "@/components/ReloadButton";
import { SearchBar } from "@/components/SearchBar";
import { SortButton } from "@/components/SortButton";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { getPageInfo, usePagination } from "@/hooks/usePagination";
import { useSortable } from "@/hooks/useSortable";
import type { Notification } from "@/interfaces/notification.interface";
import { useMarkAsReadWithToast, useNotifications } from "@/services/notificationService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function NotificationManagement() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria[]>([]);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Query hooks
  const { data: notifications, isLoading, refetch } = useNotifications();
  const markAsReadMutation = useMarkAsReadWithToast();

  // Reverse the list to show newest first
  const reversedNotifications = useMemo(() => {
    return notifications ? [...notifications].reverse() : [];
  }, [notifications]);

  // Filter and search
  const filteredNotifications = useMemo(() => {
    let filtered = reversedNotifications;

    // Apply search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (notification) =>
          notification.message?.toLowerCase().includes(lowerSearch) ||
          notification.title?.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply filters
    filterCriteria.forEach((filter) => {
      if (filter.field === "read" && typeof filter.value === "string") {
        filtered = filtered.filter(
          (notification) => notification.read === (filter.value === "true")
        );
      }
    });

    return filtered;
  }, [reversedNotifications, searchTerm, filterCriteria]);

  // Sorting
  const { sortedData, getSortProps } = useSortable<Notification>(filteredNotifications);

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
        value: "read",
        type: "select" as const,
        selectOptions: [
          { value: "false", label: "Unread" },
          { value: "true", label: "Read" },
        ],
      },
    ],
    []
  );

  // Search options
  const searchOptions = useMemo(
    () => [
      { value: "title", label: "Title" },
      { value: "message", label: "Message" },
    ],
    []
  );

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.id) return;

    try {
      await markAsReadMutation.mutateAsync({
        params: { path: { id: notification.id } },
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Notification marked as read",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      refetch();
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to mark notification as read",
      });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
        <Text className="mt-4 text-base text-gray-600 dark:text-gray-300">
          Loading notifications...
        </Text>
      </SafeAreaView>
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
                  Notification Management
                </Text>
                <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  View and manage system notifications (read-only)
                </Text>
              </View>
            </View>
            <ReloadButton onRefresh={() => refetch()} />
          </View>
        </View>

        {/* Notifications List */}
        <View className="flex-1 px-6 pt-4">
          {/* Search and Filter */}
          <View className="mb-4 gap-3">
            <SearchBar
              searchOptions={searchOptions}
              onSearchChange={setSearchTerm}
              placeholder="Search by title or message..."
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
          <View className="mb-2 flex-row items-center border-b border-gray-200 pb-2 dark:border-gray-700">
            <View className="flex-1">
              <SortButton {...getSortProps("title")} label="Title" />
            </View>
            <View className="flex-1">
              <SortButton {...getSortProps("createdAt")} label="Date" />
            </View>
            <View className="w-20">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</Text>
            </View>
          </View>

          {/* Notifications FlatList */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-12">
              <ActivityIndicator size="large" color="#FF6D00" />
            </View>
          ) : currentPageData.length === 0 ? (
            <View className="items-center py-12">
              <MaterialIcons name="notifications-none" size={64} color="#ccc" />
              <Text className="mt-4 text-center text-base text-gray-600 dark:text-gray-300">
                {searchTerm || filterCriteria.length > 0
                  ? "No notifications found matching your criteria"
                  : "No notifications found"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={currentPageData}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={({ item: notification }) => (
                <View
                  className={`mb-3 rounded-xl border p-4 ${
                    notification.read
                      ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                      : "border-[#FF6D00] bg-orange-50 dark:bg-orange-900"
                  }`}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-lg font-bold text-[#000000] dark:text-white">
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View className="h-2 w-2 rounded-full bg-[#FF6D00]" />
                        )}
                      </View>
                      <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {notification.message}
                      </Text>
                      {notification.account && (
                        <Text className="mt-2 text-xs text-gray-500">
                          To: {notification.account.name} ({notification.account.mail})
                        </Text>
                      )}
                      <Text className="mt-1 text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      {!notification.read && (
                        <TouchableOpacity
                          className="rounded-lg bg-green-500 p-2 active:bg-green-600"
                          onPress={() => handleMarkAsRead(notification)}>
                          <MaterialIcons name="check" size={20} color="white" />
                        </TouchableOpacity>
                      )}
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
