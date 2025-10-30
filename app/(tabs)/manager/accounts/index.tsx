import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { Account } from "@/interfaces/account.interface";
import type { ROLE_TYPE } from "@/interfaces/role.interface";
import {
  transformAccountCreateRequest,
  transformAccountUpdateRequest,
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from "@/services/accountService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AccountForm from "./AccountForm";

export default function AccountManagement() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null);

  const queryClient = useQueryClient();

  // Query hooks
  const { data: accounts, isLoading } = useAccounts();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const handleAdd = () => {
    setSelectedAccount(null);
    setIsFormVisible(true);
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setIsFormVisible(true);
  };

  const handleDelete = (account: Account) => {
    setDeleteConfirm(account);
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
        text2: "Account deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/account"] });
      setDeleteConfirm(null);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete account",
      });
    }
  };

  const handleSubmit = async (data: {
    name: string;
    email: string;
    password?: string;
    role: ROLE_TYPE;
    active: boolean;
  }) => {
    try {
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

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Account updated successfully",
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
        });

        await createMutation.mutateAsync({
          body: createData,
        });

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Account created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/account"] });
      setIsFormVisible(false);
      setSelectedAccount(null);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: selectedAccount ? "Failed to update account" : "Failed to create account",
      });
    }
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
              Are you sure you want to delete the account &quot;{deleteConfirm.name}&quot; (
              {deleteConfirm.mail})?
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
            <View>
              <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                Account Management
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Manage user accounts and permissions
              </Text>
            </View>
            <Button className="bg-[#FF6D00] active:bg-[#FF4D00]" onPress={handleAdd}>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="font-semibold text-white">Add</Text>
              </View>
            </Button>
          </View>
        </View>

        {/* Accounts List */}
        <ScrollView className="flex-1" contentContainerClassName="p-6">
          {!accounts || accounts.length === 0 ? (
            <View className="items-center py-12">
              <MaterialIcons name="people-outline" size={64} color="#ccc" />
              <Text className="mt-4 text-center text-base text-gray-600 dark:text-gray-300">
                No accounts found
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {accounts.map((account: Account) => (
                <TouchableOpacity
                  key={account.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
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
                        className="rounded-lg bg-red-500 p-2 active:bg-red-600"
                        onPress={() => handleDelete(account)}>
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
