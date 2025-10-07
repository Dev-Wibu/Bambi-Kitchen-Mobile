import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { Discount } from "@/interfaces/discount.interface";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DiscountFormProps {
  discount: Discount | null;
  onSubmit: (data: {
    name: string;
    discountPercent?: number;
    quantity?: number;
    startTime?: string;
    endTime?: string;
    code?: string;
    description?: string;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function DiscountForm({
  discount,
  onSubmit,
  onCancel,
  isLoading,
}: DiscountFormProps) {
  const [name, setName] = useState(discount?.name || "");
  const [code, setCode] = useState(discount?.code || "");
  const [discountPercent, setDiscountPercent] = useState(
    discount?.discountPercent?.toString() || ""
  );
  const [quantity, setQuantity] = useState(discount?.quantity?.toString() || "");
  const [startTime, setStartTime] = useState(
    discount?.startTime ? new Date(discount.startTime).toISOString().split("T")[0] : ""
  );
  const [endTime, setEndTime] = useState(
    discount?.endTime ? new Date(discount.endTime).toISOString().split("T")[0] : ""
  );
  const [description, setDescription] = useState(discount?.description || "");

  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
    discountPercent?: string;
    quantity?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!discount && !code.trim()) {
      newErrors.code = "Code is required for new discounts";
    } else if (code && code.length < 3) {
      newErrors.code = "Code must be at least 3 characters";
    }

    if (discountPercent) {
      const percent = Number.parseInt(discountPercent);
      if (Number.isNaN(percent) || percent < 0 || percent > 100) {
        newErrors.discountPercent = "Discount percent must be between 0 and 100";
      }
    }

    if (quantity) {
      const qty = Number.parseInt(quantity);
      if (Number.isNaN(qty) || qty < 0) {
        newErrors.quantity = "Quantity must be a positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        name: name.trim(),
        code: code.trim() || undefined,
        discountPercent: discountPercent ? Number.parseInt(discountPercent) : undefined,
        quantity: quantity ? Number.parseInt(quantity) : undefined,
        startTime: startTime ? new Date(startTime).toISOString() : undefined,
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
        description: description.trim() || undefined,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onCancel} className="mr-4">
              <MaterialIcons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                {discount ? "Edit Discount" : "Create Discount"}
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {discount ? "Update discount information" : "Add a new discount"}
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <ScrollView className="flex-1" contentContainerClassName="p-6">
          {/* Name Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Name *</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Enter name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              editable={!isLoading}
            />
            {errors.name && <Text className="mt-1 text-sm text-red-500">{errors.name}</Text>}
          </View>

          {/* Code Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">
              Code {!discount && "*"}
            </Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Enter discount code"
              placeholderTextColor="#999"
              value={code}
              onChangeText={(text) => {
                setCode(text.toUpperCase());
                if (errors.code) setErrors({ ...errors, code: undefined });
              }}
              autoCapitalize="characters"
              editable={!isLoading}
            />
            {errors.code && <Text className="mt-1 text-sm text-red-500">{errors.code}</Text>}
          </View>

          {/* Discount Percent Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Discount Percent</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Enter discount percent (0-100)"
              placeholderTextColor="#999"
              value={discountPercent}
              onChangeText={(text) => {
                setDiscountPercent(text);
                if (errors.discountPercent) setErrors({ ...errors, discountPercent: undefined });
              }}
              keyboardType="numeric"
              editable={!isLoading}
            />
            {errors.discountPercent && (
              <Text className="mt-1 text-sm text-red-500">{errors.discountPercent}</Text>
            )}
          </View>

          {/* Quantity Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Quantity</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Enter quantity"
              placeholderTextColor="#999"
              value={quantity}
              onChangeText={(text) => {
                setQuantity(text);
                if (errors.quantity) setErrors({ ...errors, quantity: undefined });
              }}
              keyboardType="numeric"
              editable={!isLoading}
            />
            {errors.quantity && (
              <Text className="mt-1 text-sm text-red-500">{errors.quantity}</Text>
            )}
          </View>

          {/* Start Time Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Start Date</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              value={startTime}
              onChangeText={setStartTime}
              editable={!isLoading}
            />
          </View>

          {/* End Time Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">End Date</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              value={endTime}
              onChangeText={setEndTime}
              editable={!isLoading}
            />
          </View>

          {/* Description Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Description</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Enter description (optional)"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>

          {/* Buttons */}
          <View className="mt-6 gap-3">
            <Button
              className="w-full bg-[#FF6D00] active:bg-[#FF4D00]"
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-bold text-white">
                  {discount ? "Update Discount" : "Create Discount"}
                </Text>
              )}
            </Button>
            <Button
              className="w-full bg-gray-300 active:bg-gray-400"
              onPress={onCancel}
              disabled={isLoading}>
              <Text className="text-lg font-bold text-[#000000]">Cancel</Text>
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
