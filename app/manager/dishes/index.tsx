import {
  useCreateDish,
  useDishes,
  useToggleDishActive,
  useToggleDishPublic,
} from "@/services/dishService";
import { useAuthStore } from "@/stores/authStore";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function DishesManager() {
  const router = useRouter();
  // Hàm upload ảnh lên Cloudinary
  async function uploadImageToCloudinary(uri: string): Promise<string | null> {
    const data = new FormData();
    data.append("file", {
      uri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);
    data.append("upload_preset", "unsigned_preset"); // Thay bằng upload_preset của bạn
    // Không cần append cloud_name vào FormData
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dbxbsd3cu/image/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      return json.secure_url as string;
    } catch (e) {
      return null;
    }
  }

  const { data, isLoading, refetch, isError } = useDishes();
  const createOrUpdateDish = useCreateDish();
  const togglePublicMutation = useToggleDishPublic();
  const toggleActiveMutation = useToggleDishActive();
  const [modalVisible, setModalVisible] = useState(false);
  const [id, setId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [active, setActive] = useState(true);
  const [dishType, setDishType] = useState<"PRESET" | "CUSTOM">("PRESET");
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<any>(null);
  const [ingredients, setIngredients] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const openModal = (dish?: any) => {
    if (dish) {
      setId(dish.id);
      setName(dish.name || "");
      setDescription(dish.description || "");
      setPrice(dish.price ? String(dish.price) : "");
      setIsPublic(dish.public ?? true);
      setActive(dish.active ?? true);
      setDishType(dish.dishType || "PRESET");
      setImage(dish.imageUrl || null);
      setFile(null);
      setIngredients(dish.ingredients || {});
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setId(null);
    setName("");
    setDescription("");
    setPrice("");
    setIsPublic(true);
    setActive(true);
    setDishType("PRESET");
    setImage(null);
    setFile(null);
    setIngredients({});
  };

  // Chọn ảnh từ thư viện
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setFile(result.assets[0]);
    }
  };

  // Chụp ảnh mới bằng camera
  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setFile(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim()) {
      Toast.show({ type: "error", text1: "Name and price required" });
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = image;
      if (file && file.uri) {
        imageUrl = await uploadImageToCloudinary(file.uri);
        if (!imageUrl) {
          Toast.show({ type: "error", text1: "Upload image failed" });
          setSubmitting(false);
          return;
        }
      }
      // Lấy account từ authStore
      const user = useAuthStore.getState().user;
      if (!user) {
        Toast.show({ type: "error", text1: "Missing account info" });
        setSubmitting(false);
        return;
      }
      const account = { id: user.userId };
      // Đảm bảo ingredients luôn là object không null và không rỗng
      // Backend yêu cầu ingredients phải có ít nhất 1 item
      const safeIngredients =
        ingredients && typeof ingredients === "object" && Object.keys(ingredients).length > 0
          ? ingredients
          : { 1: 1 }; // Default: ingredient ID 1 với số lượng 1

      const request: any = {
        name,
        description,
        price: Number(price),
        public: isPublic,
        active,
        dishType,
        file: imageUrl,
        account,
        ingredients: safeIngredients,
      };
      if (id) request.id = id;

      // Use custom fetch to handle deeply-nested objects
      // Backend expects @ModelAttribute which is form-encoded data
      const formData = new URLSearchParams();
      formData.append("name", request.name);
      if (request.description) formData.append("description", request.description);
      formData.append("price", String(request.price));
      formData.append("isPublic", String(request.public));
      formData.append("isActive", String(request.active));
      formData.append("dishType", request.dishType);
      if (request.file) formData.append("file", request.file);
      formData.append("account.id", String(request.account.id));
      // Serialize ingredients as individual form params
      Object.entries(request.ingredients).forEach(([key, value]) => {
        formData.append(`ingredients[${key}]`, String(value));
      });
      if (request.id) formData.append("id", String(request.id));

      const response = await fetch("https://bambi.kdz.asia/api/dish", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save dish");
      }

      Toast.show({ type: "success", text1: id ? "Dish updated" : "Dish created" });
      resetForm();
      setModalVisible(false);
      refetch(); // Reload the list after create/update
    } catch (error) {
      console.log("Dish create/update error:", error);
      Toast.show({
        type: "error",
        text1: id ? "Update failed" : "Create failed",
        text2: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
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
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ backgroundColor: "#F3F4F6", borderRadius: 24, padding: 8 }}>
            <MaterialIcons name="refresh" size={28} color="#FF6D00" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              resetForm();
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

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)", justifyContent: "flex-end" }}>
          <View className="rounded-t-2xl bg-white p-4 dark:bg-gray-900">
            <Text className="mb-2 text-lg font-bold text-[#FF6D00]">
              {id ? "Edit Dish" : "Add New Dish"}
            </Text>
            <TextInput
              className="mb-2 rounded-lg border bg-white px-3 py-2 dark:bg-gray-900"
              placeholder="Dish name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              className="mb-2 rounded-lg border bg-white px-3 py-2 dark:bg-gray-900"
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <TextInput
              className="mb-2 rounded-lg border bg-white px-3 py-2 dark:bg-gray-900"
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <View className="mb-2 flex-row items-center">
              <Text className="mr-2">Public:</Text>
              <Pressable
                className={`rounded-full px-3 py-1 ${isPublic ? "bg-[#FF6D00]" : "bg-gray-300"}`}
                onPress={() => setIsPublic((v) => !v)}>
                <Text className="font-bold text-white">{isPublic ? "Yes" : "No"}</Text>
              </Pressable>
              <Text className="ml-4 mr-2">Active:</Text>
              <Pressable
                className={`rounded-full px-3 py-1 ${active ? "bg-[#FF6D00]" : "bg-gray-300"}`}
                onPress={() => setActive((v) => !v)}>
                <Text className="font-bold text-white">{active ? "Yes" : "No"}</Text>
              </Pressable>
            </View>
            <View className="mb-2 flex-row items-center">
              <Text className="mr-2">Dish Type:</Text>
              <Pressable
                className={`rounded-full px-3 py-1 ${dishType === "PRESET" ? "bg-[#FF6D00]" : "bg-gray-300"}`}
                onPress={() => setDishType("PRESET")}>
                <Text className="font-bold text-white">PRESET</Text>
              </Pressable>
              <Pressable
                className={`ml-2 rounded-full px-3 py-1 ${dishType === "CUSTOM" ? "bg-[#FF6D00]" : "bg-gray-300"}`}
                onPress={() => setDishType("CUSTOM")}>
                <Text className="font-bold text-white">CUSTOM</Text>
              </Pressable>
            </View>
            <View className="mb-2">
              <View className="flex-row items-center">
                <Text className="mr-2">Image:</Text>
                <Pressable
                  className="mr-2 rounded-xl bg-[#FF6D00] px-3 py-1"
                  onPress={handlePickImage}>
                  <Text className="font-bold text-white">Chọn ảnh</Text>
                </Pressable>
                <Pressable className="rounded-xl bg-[#FF6D00] px-3 py-1" onPress={handleTakePhoto}>
                  <Text className="font-bold text-white">Chụp ảnh</Text>
                </Pressable>
                {image && (
                  <Image
                    source={{ uri: image }}
                    style={{ width: 60, height: 60, borderRadius: 8, marginLeft: 12 }}
                  />
                )}
              </View>
              <Text className="mt-1 text-xs text-gray-500">
                Nhấn "Upload" để chọn ảnh từ máy. Ảnh sẽ tự động được lưu lên hệ thống khi bạn lưu
                món ăn.
              </Text>
            </View>
            <View className="mt-2 flex-row">
              <Pressable
                className="mr-2 flex-1 rounded-xl bg-[#FF6D00] py-2"
                onPress={async () => {
                  await handleSubmit();
                  setModalVisible(false);
                }}
                disabled={submitting}>
                <Text className="text-center font-bold text-white">
                  {submitting
                    ? id
                      ? "Updating..."
                      : "Adding..."
                    : id
                      ? "Update Dish"
                      : "Add Dish"}
                </Text>
              </Pressable>
              <Pressable
                className="ml-2 flex-1 rounded-xl bg-gray-400 py-2"
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}>
                <Text className="text-center font-bold text-white">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
