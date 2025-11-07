import { Filter, type FilterCriteria } from "@/components/Filter";
import ReloadButton from "@/components/ReloadButton";
import { SearchBar } from "@/components/SearchBar";
import { SortButton } from "@/components/SortButton";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { getPageInfo, usePagination } from "@/hooks/usePagination";
import { useSortable } from "@/hooks/useSortable";
import type { Account } from "@/interfaces/account.interface";
import { ROLE_TYPE } from "@/interfaces/role.interface";
import {
  transformAccountCreateRequest,
  transformAccountUpdateRequest,
  useAccounts,
  useCreateAccountWithToast,
  useToggleAccountActiveWithToast,
  useUpdateAccountWithToast,
} from "@/services/accountService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AccountForm from "./AccountForm";

export default function AccountManagement() {
  const router = useRouter();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria[]>([]);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Query hooks
  const { data: accounts, isLoading, refetch } = useAccounts();
  const createMutation = useCreateAccountWithToast();
  const updateMutation = useUpdateAccountWithToast();
  const toggleActiveMutation = useToggleAccountActiveWithToast();

  // Reverse the list to show newest first
  const reversedAccounts = useMemo(() => {
    return accounts ? [...accounts].reverse() : [];
  }, [accounts]);

  // Filter and search
  const filteredAccounts = useMemo(() => {
    let filtered = reversedAccounts;

    // Apply search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (account) =>
          account.name?.toLowerCase().includes(lowerSearch) ||
          account.mail?.toLowerCase().includes(lowerSearch) ||
          account.phone?.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply filters
    filterCriteria.forEach((filter) => {
      if (filter.field === "role" && typeof filter.value === "string") {
        filtered = filtered.filter((account) => account.role === filter.value);
      }
      if (filter.field === "active" && typeof filter.value === "string") {
        filtered = filtered.filter((account) => account.active === (filter.value === "true"));
      }
    });

    return filtered;
  }, [reversedAccounts, searchTerm, filterCriteria]);

  // Sorting
  const { sortedData, getSortProps } = useSortable<Account>(filteredAccounts);

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
        label: "Role",
        value: "role",
        type: "select" as const,
        selectOptions: [
          { value: "ADMIN", label: "Admin" },
          { value: "STAFF", label: "Staff" },
          { value: "USER", label: "User" },
        ],
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
    ],
    []
  );

  // Search options
  const searchOptions = useMemo(
    () => [
      { value: "name", label: "Name" },
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone" },
    ],
    []
  );

  const handleAdd = () => {
    setSelectedAccount(null);
    setIsFormVisible(true);
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setIsFormVisible(true);
  };

  const handleToggleActive = (account: Account) => {
    setToggleConfirm(account);
  };

  const confirmToggleActive = async () => {
    if (!toggleConfirm?.id) return;

    const updateData = transformAccountUpdateRequest({
      id: toggleConfirm.id,
      name: toggleConfirm.name,
      email: toggleConfirm.mail,
      role: toggleConfirm.role,
      active: !toggleConfirm.active,
    });

    await toggleActiveMutation.mutateAsync({
      body: updateData,
    });

    queryClient.invalidateQueries({ queryKey: ["/api/account"] });
    refetch();
    setToggleConfirm(null);
  };

  const handleSubmit = async (data: {
    name: string;
    email: string;
    password?: string;
    role: ROLE_TYPE;
    active: boolean;
  }) => {
    if (selectedAccount?.id) {
      // Update existing account
      const updateData = transformAccountUpdateRequest({
        id: selectedAccount.id,
        name: data.name,
        email: data.email,
        role: data.role,
        active: data.active,
      });

      await updateMutation.mutateAsync({
        body: updateData,
      });
    } else {
      // Create new account
      if (!data.password) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Password is required for new accounts",
        });
        return;
      }

      const createData = transformAccountCreateRequest({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        active: data.active,
      });

      await createMutation.mutateAsync({
        body: createData,
      });
    }

    queryClient.invalidateQueries({ queryKey: ["/api/account"] });
    refetch(); // Reload the list after create/update
    setIsFormVisible(false);
    setSelectedAccount(null);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
        <Text className="mt-4 text-base text-gray-600 dark:text-gray-300">Loading accounts...</Text>
      </SafeAreaView>
    );
  }

  if (isFormVisible) {
    return (
      <AccountForm
        account={selectedAccount}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsFormVisible(false);
          setSelectedAccount(null);
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  if (toggleConfirm) {
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
              Confirm Status Change
            </Text>
            <Text className="mt-2 text-center text-base text-gray-600 dark:text-gray-300">
              Are you sure you want to {toggleConfirm.active ? "deactivate" : "activate"} the
              account &quot;{toggleConfirm.name}&quot; ({toggleConfirm.mail})?
            </Text>
            <View className="mt-6 flex-row gap-3">
              <Button
                className="flex-1 bg-gray-300 active:bg-gray-400"
                onPress={() => setToggleConfirm(null)}>
                <Text className="font-semibold text-[#000000]">Cancel</Text>
              </Button>
              <Button
                className={`flex-1 ${toggleConfirm.active ? "bg-orange-500 active:bg-orange-600" : "bg-green-500 active:bg-green-600"}`}
                onPress={confirmToggleActive}
                disabled={toggleActiveMutation.isPending}>
                {toggleActiveMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-semibold text-white">
                    {toggleConfirm.active ? "Deactivate" : "Activate"}
                  </Text>
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
            <View className="flex-1 flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.back()} className="mr-2">
                <MaterialIcons name="arrow-back" size={24} color="#FF6D00" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                  Account Management
                </Text>
                <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Manage user accounts and permissions
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

        {/* Search and Filter */}
        <View className="border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
          <SearchBar
            searchOptions={searchOptions}
            onSearchChange={setSearchTerm}
            placeholder="Search by name, email, or phone..."
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
            <SortButton {...getSortProps("role")} label="Role" />
            <SortButton {...getSortProps("active")} label="Status" />
          </View>
        </View>

        {/* Accounts List */}
        <View className="flex-1">
          <FlatList
            data={currentPageData}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerClassName="p-6"
            ListEmptyComponent={
              <View className="items-center py-12">
                <MaterialIcons name="people-outline" size={64} color="#ccc" />
                <Text className="mt-4 text-center text-base text-gray-600 dark:text-gray-300">
                  No accounts found
                </Text>
              </View>
            }
            renderItem={({ item: account }) => (
              <TouchableOpacity
                className="mb-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                activeOpacity={0.7}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg font-bold text-[#000000] dark:text-white">
                        {account.name}
                      </Text>
                      <View
                        className={`rounded-full px-2 py-1 ${
                          account.role === "ADMIN"
                            ? "bg-purple-100"
                            : account.role === "STAFF"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                        }`}>
                        <Text
                          className={`text-xs font-semibold ${
                            account.role === "ADMIN"
                              ? "text-purple-700"
                              : account.role === "STAFF"
                                ? "text-blue-700"
                                : "text-gray-700"
                          }`}>
                          {account.role}
                        </Text>
                      </View>
                    </View>
                    <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {account.mail}
                    </Text>
                    {account.phone && (
                      <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {account.phone}
                      </Text>
                    )}
                    <View className="mt-2 flex-row items-center gap-2">
                      <View
                        className={`rounded-full px-2 py-1 ${
                          account.active ? "bg-green-100" : "bg-red-100"
                        }`}>
                        <Text
                          className={`text-xs font-semibold ${
                            account.active ? "text-green-700" : "text-red-700"
                          }`}>
                          {account.active ? "Active" : "Inactive"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="rounded-lg bg-blue-500 p-2 active:bg-blue-600"
                      onPress={() => handleEdit(account)}>
                      <MaterialIcons name="edit" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`rounded-lg p-2 ${account.active ? "bg-orange-500 active:bg-orange-600" : "bg-green-500 active:bg-green-600"}`}
                      onPress={() => handleToggleActive(account)}>
                      <MaterialIcons
                        name={account.active ? "block" : "check-circle"}
                        size={20}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
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
      </View>
    </SafeAreaView>
  );
}
