import { useIngredients } from "@/services/ingredientService";
import { useAuthStore } from "@/stores/authStore";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { API_BASE_URL } from "@/libs/api";
import type { components } from "@/schema-from-be";

type IngredientDetail = components["schemas"]["IngredientDetail"];
type IngredientsGetByDishResponse = components["schemas"]["IngredientsGetByDishResponse"];

interface FileUpload {
  uri: string;
  type: string;
  name: string;
}

interface DishFormProps {
  visible: boolean;
  dish: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DishForm({ visible, dish, onClose, onSuccess }: DishFormProps) {
  const { data: availableIngredients, isLoading: loadingIngredients } = useIngredients();

  const [id, setId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [active, setActive] = useState(true);
  const [dishType, setDishType] = useState<"PRESET" | "CUSTOM">("PRESET");
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<any>(null);
  const [ingredients, setIngredients] = useState<{ [key: number]: number }>({});
  const [submitting, setSubmitting] = useState(false);
  const [showIngredientSelector, setShowIngredientSelector] = useState(false);

  // Initialize form with dish data
  useEffect(() => {
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
      // Don't set ingredients here - will be fetched from API in separate useEffect
    } else {
      resetForm();
    }
  }, [dish]);

  // Fetch recipe/ingredients when editing a dish
  // Similar to WEB EditDishModal.tsx (lines 80-124)
  useEffect(() => {
    const fetchRecipe = async () => {
      if (dish?.id) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/recipe/by-dish/${dish.id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${useAuthStore.getState().token}`,
            },
          });

          if (response.ok) {
            const data: IngredientsGetByDishResponse = await response.json();
            // Response format: IngredientsGetByDishResponse with ingredients array
            // Each ingredient has: { id, name, neededQuantity, storedQuantity, ... }
            if (data && Array.isArray(data.ingredients)) {
              const recipe: { [key: number]: number } = {};
              data.ingredients.forEach((item: IngredientDetail) => {
                if (typeof item.id === "number" && typeof item.neededQuantity === "number") {
                  recipe[item.id] = item.neededQuantity;
                }
              });
              setIngredients(recipe);
            }
          }
        } catch (error) {
          console.error("Error fetching recipe:", error);
          // Keep ingredients empty if fetch fails
        }
      } else {
        // When creating new dish, reset ingredients
        setIngredients({});
      }
    };

    if (visible) {
      fetchRecipe();
    }
  }, [visible, dish?.id]);

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

  const addIngredient = (ingredientId: number) => {
    setIngredients((prev) => ({
      ...prev,
      [ingredientId]: prev[ingredientId] ? prev[ingredientId] + 1 : 1,
    }));
  };

  const updateIngredientQuantity = (ingredientId: number, quantity: number) => {
    if (quantity <= 0) {
      const newIngredients = { ...ingredients };
      delete newIngredients[ingredientId];
      setIngredients(newIngredients);
    } else {
      setIngredients((prev) => ({
        ...prev,
        [ingredientId]: quantity,
      }));
    }
  };

  const removeIngredient = (ingredientId: number) => {
    const newIngredients = { ...ingredients };
    delete newIngredients[ingredientId];
    setIngredients(newIngredients);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim()) {
      Toast.show({ type: "error", text1: "Name and price required" });
      return;
    }

    // Validate that at least one ingredient is selected with quantity > 0
    const validIngredients = Object.entries(ingredients).filter(([, qty]) => qty > 0);
    if (validIngredients.length === 0) {
      Toast.show({
        type: "error",
        text1: "At least one ingredient required",
        text2: "Please select ingredients for this dish",
      });
      return;
    }

    setSubmitting(true);
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        Toast.show({ type: "error", text1: "Missing account info" });
        setSubmitting(false);
        return;
      }
      const account = { id: user.userId };

      const formData = new FormData();
      formData.append("name", name);
      if (description) formData.append("description", description);
      formData.append("price", String(price));
      formData.append("public", String(isPublic));
      formData.append("active", String(active));
      formData.append("dishType", dishType);
      formData.append("account.id", String(account.id));

      // Append file - BE expects this field to always be present
      // If user selected a new file, use it. Otherwise, send an empty file.
      if (file && file.uri) {
        const fileToUpload: FileUpload = {
          uri: file.uri,
          type: file.mimeType || "image/jpeg",
          name: file.fileName || "dish_image.jpg",
        };
        formData.append("file", fileToUpload as any);
      } else {
        // Send empty file object to prevent null pointer exception in BE
        // React Native FormData expects an object with uri, type, and name
        // Using data URI for empty file (0 bytes) - same pattern as IngredientForm fix
        const emptyFile: FileUpload = {
          uri: "data:application/octet-stream;base64,",
          type: "application/octet-stream",
          name: "empty.txt",
        };
        formData.append("file", emptyFile as any);
      }

      // Send ingredients map - BE requires Map<Integer, Integer>
      // User must select at least one ingredient
      // Filter to only send ingredients with quantity > 0
      Object.entries(ingredients)
        .filter(([, qty]) => qty > 0)
        .forEach(([key, value]) => {
          formData.append(`ingredients[${key}]`, String(value));
        });

      if (id) formData.append("id", String(id));

      const response = await fetch(`${API_BASE_URL}/api/dish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to save dish";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorJson.ingredients || errorText;
        } catch {
          errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const successMessage =
        responseData?.message || (id ? "Dish updated successfully" : "Dish created successfully");

      Toast.show({ type: "success", text1: "Success", text2: successMessage });
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.log("Dish create/update error:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again";
      Toast.show({
        type: "error",
        text1: id ? "Update Failed" : "Create Failed",
        text2: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getIngredientName = (ingredientId: number) => {
    const ingredient = availableIngredients?.find((ing) => ing.id === ingredientId);
    return ingredient?.name || `Ingredient ${ingredientId}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => {
        onClose();
        resetForm();
      }}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View className="max-h-[90%] rounded-t-2xl bg-white p-4 dark:bg-gray-900">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="mb-3 text-lg font-bold text-[#FF6D00]">
              {id ? "Edit Dish" : "Add New Dish"}
            </Text>

            {/* Name */}
            <TextInput
              className="mb-2 rounded-lg border bg-white px-3 py-2 dark:bg-gray-900"
              placeholder="Dish name"
              value={name}
              onChangeText={setName}
            />

            {/* Description */}
            <TextInput
              className="mb-2 rounded-lg border bg-white px-3 py-2 dark:bg-gray-900"
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Price */}
            <TextInput
              className="mb-2 rounded-lg border bg-white px-3 py-2 dark:bg-gray-900"
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            {/* Public/Active toggles */}
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

            {/* Dish Type */}
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

            {/* Image upload */}
            <View className="mb-2">
              <View className="flex-row items-center">
                <Text className="mr-2">Image:</Text>
                <Pressable
                  className="mr-2 rounded-xl bg-[#FF6D00] px-3 py-1"
                  onPress={handlePickImage}>
                  <Text className="font-bold text-white">Choose</Text>
                </Pressable>
                <Pressable className="rounded-xl bg-[#FF6D00] px-3 py-1" onPress={handleTakePhoto}>
                  <Text className="font-bold text-white">Camera</Text>
                </Pressable>
                {image && (
                  <Image
                    source={{ uri: image }}
                    style={{ width: 60, height: 60, borderRadius: 8, marginLeft: 12 }}
                  />
                )}
              </View>
            </View>

            {/* Ingredients Section */}
            <View className="mb-3 mt-2">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-base font-bold">
                  Ingredients ({Object.keys(ingredients).length})
                </Text>
                <Pressable
                  className="rounded-xl bg-[#FF6D00] px-3 py-1"
                  onPress={() => setShowIngredientSelector(true)}>
                  <Text className="font-bold text-white">+ Add Ingredient</Text>
                </Pressable>
              </View>

              {/* Selected ingredients list */}
              {Object.keys(ingredients).length === 0 ? (
                <Text className="text-sm text-gray-500">
                  No ingredients selected. Please add at least one ingredient.
                </Text>
              ) : (
                <View className="rounded-lg border border-gray-300 p-2">
                  {Object.entries(ingredients).map(([ingredientId, quantity]) => (
                    <View
                      key={ingredientId}
                      className="mb-1 flex-row items-center justify-between rounded-md bg-gray-100 p-2">
                      <Text className="flex-1 text-sm">
                        {getIngredientName(Number(ingredientId))}
                      </Text>
                      <View className="flex-row items-center">
                        <Pressable
                          onPress={() =>
                            updateIngredientQuantity(Number(ingredientId), quantity - 1)
                          }
                          className="rounded bg-gray-300 px-2 py-1">
                          <Text>-</Text>
                        </Pressable>
                        <TextInput
                          className="mx-2 w-12 rounded border bg-white px-2 py-1 text-center"
                          value={String(quantity)}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 0;
                            updateIngredientQuantity(Number(ingredientId), num);
                          }}
                          keyboardType="numeric"
                        />
                        <Pressable
                          onPress={() =>
                            updateIngredientQuantity(Number(ingredientId), quantity + 1)
                          }
                          className="rounded bg-gray-300 px-2 py-1">
                          <Text>+</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => removeIngredient(Number(ingredientId))}
                          className="ml-2">
                          <MaterialIcons name="delete" size={20} color="#FF6D00" />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Buttons */}
            <View className="mt-2 flex-row">
              <Pressable
                className="mr-2 flex-1 rounded-xl bg-[#FF6D00] py-2"
                onPress={handleSubmit}
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
                  onClose();
                  resetForm();
                }}>
                <Text className="text-center font-bold text-white">Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Ingredient Selector Modal */}
      <Modal
        visible={showIngredientSelector}
        animationType="slide"
        transparent
        onRequestClose={() => setShowIngredientSelector(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" }}>
          <View className="mx-4 max-h-[80%] rounded-xl bg-white p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-bold">Select Ingredients</Text>
              <TouchableOpacity onPress={() => setShowIngredientSelector(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {loadingIngredients ? (
              <ActivityIndicator color="#FF6D00" />
            ) : (
              <FlatList
                data={availableIngredients}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => {
                  const isSelected = ingredients[item.id!] !== undefined;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        if (!isSelected) {
                          addIngredient(item.id!);
                        }
                        setShowIngredientSelector(false);
                      }}
                      className={`mb-2 flex-row items-center justify-between rounded-lg border p-3 ${
                        isSelected ? "border-[#FF6D00] bg-orange-50" : "border-gray-300"
                      }`}>
                      <View className="flex-1">
                        <Text className="font-bold">{item.name}</Text>
                        <Text className="text-xs text-gray-500">
                          {item.unit} - Available: {item.available}
                        </Text>
                      </View>
                      {isSelected && (
                        <MaterialIcons name="check-circle" size={24} color="#FF6D00" />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text className="text-center text-gray-500">No ingredients available</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
