import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

/**
 * Hook to handle mutations with automatic toast notifications
 * Catches API response messages and displays them to the user
 *
 * @example
 * const { mutate } = useMutationHandler({
 *   mutationFn: createAccount,
 *   onSuccess: () => console.log("Success"),
 *   successMessage: "Account created successfully",
 * });
 */
export function useMutationHandler<TData = unknown, TVariables = unknown>({
  mutationFn,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  showSuccessToast = true,
  showErrorToast = true,
  ...options
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  [key: string]: any;
}) {
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      // Try to extract message from response
      let message = successMessage;
      if (!message && typeof data === "object" && data !== null) {
        const response = data as any;
        message = response.message || response.msg || "Operation completed successfully";
      }

      // Show success toast
      if (showSuccessToast && message) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: message,
        });
      }

      // Call custom success handler
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: Error) => {
      // Try to extract error message
      let message = errorMessage || error.message || "An error occurred";

      // Try to parse error response
      try {
        const errorData = JSON.parse(error.message);
        message = errorData.message || errorData.error || message;
      } catch {
        // If parsing fails, use the original error message
      }

      // Show error toast
      if (showErrorToast) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: message,
        });
      }

      // Call custom error handler
      if (onError) {
        onError(error);
      }
    },
    ...options,
  });
}
