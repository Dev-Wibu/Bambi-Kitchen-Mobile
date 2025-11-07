import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { Account } from "@/interfaces/account.interface";
import { ROLES, type ROLE_TYPE } from "@/interfaces/role.interface";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AccountFormProps {
  account: Account | null;
  onSubmit: (data: {
    name: string;
    email: string;
    password?: string;
    role: ROLE_TYPE;
    active: boolean;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function AccountForm({ account, onSubmit, onCancel, isLoading }: AccountFormProps) {
  const [name, setName] = useState(account?.name || "");
  const [email, setEmail] = useState(account?.mail || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<ROLE_TYPE>(account?.role || ROLES.USER);
  const [active, setActive] = useState(account?.active ?? true);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!account && !password) {
      newErrors.password = "Password is required for new accounts";
    } else if (password && (password.length < 6 || password.length > 50)) {
      newErrors.password = "Password must be between 6 and 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        name: name.trim(),
        email: email.trim(),
        password: password || undefined,
        role,
        active,
      });
    }
  };

  const roles: ROLE_TYPE[] = [ROLES.USER, ROLES.STAFF, ROLES.ADMIN];

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
                {account ? "Edit Account" : "Create Account"}
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {account ? "Update account information" : "Add a new account"}
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

          {/* Email Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Email *</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Enter email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            {errors.email && <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>}
          </View>

          {/* Password Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">
              Password {!account && "*"}
            </Text>
            <View className="relative">
              <TextInput
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder={account ? "Leave blank to keep current" : "Enter password"}
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="mt-1 text-sm text-red-500">{errors.password}</Text>
            )}
            {!account && (
              <Text className="mt-1 text-xs text-gray-500">
                Password must be between 6 and 50 characters
              </Text>
            )}
          </View>

          {/* Role Field */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-[#757575]">Role *</Text>
            <View className="flex-row gap-2">
              {roles.map((r) => (
                <TouchableOpacity
                  key={r}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 ${
                    role === r
                      ? "border-[#FF6D00] bg-orange-50"
                      : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                  }`}
                  onPress={() => setRole(r)}
                  disabled={isLoading}
                  activeOpacity={0.7}>
                  <Text
                    className={`text-center text-sm font-semibold ${
                      role === r ? "text-[#FF6D00]" : "text-[#000000] dark:text-white"
                    }`}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Active Toggle */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-semibold text-[#757575]">Active Status</Text>
                <Text className="mt-1 text-xs text-gray-500">
                  {active ? "Account is active" : "Account is inactive"}
                </Text>
              </View>
              <Switch
                value={active}
                onValueChange={setActive}
                disabled={isLoading}
                trackColor={{ false: "#ccc", true: "#FF6D00" }}
                thumbColor="#fff"
              />
            </View>
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
                  {account ? "Update Account" : "Create Account"}
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
