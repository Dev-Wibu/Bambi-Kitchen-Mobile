import { BaseToast, ErrorToast } from "react-native-toast-message";

/**
 * Custom toast configuration for react-native-toast-message
 * Provides consistent styling across the app
 */
export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#4CAF50",
        borderLeftWidth: 5,
        backgroundColor: "#FFFFFF",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
      }}
      text2Style={{
        fontSize: 14,
        color: "#666666",
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#F44336",
        borderLeftWidth: 5,
        backgroundColor: "#FFFFFF",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
      }}
      text2Style={{
        fontSize: 14,
        color: "#666666",
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#2196F3",
        borderLeftWidth: 5,
        backgroundColor: "#FFFFFF",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
      }}
      text2Style={{
        fontSize: 14,
        color: "#666666",
      }}
    />
  ),
};
