import ReloadButton from "@/components/ReloadButton";
import {
  useAllDishes,
  useToggleDishActiveWithToast,
  useToggleDishPublicWithToast,
} from "@/services/dishService";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import DishForm from "./DishForm";

export default function DishesManager() {
  const router = useRouter();

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

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
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
      {isLoading ? (
        <ActivityIndicator color="#FF6D00" style={{ marginTop: 32 }} />
      ) : isError ? (
        <Text className="mt-8 text-center text-red-500">Failed to load dishes</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
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
          ListEmptyComponent={
            <Text className="mt-8 text-center text-gray-400">No dishes found.</Text>
          }
        />
      )}

      <DishForm
        visible={modalVisible}
        dish={selectedDish}
        onClose={() => setModalVisible(false)}
        onSuccess={() => refetch()}
      />
    </View>
  );
}
