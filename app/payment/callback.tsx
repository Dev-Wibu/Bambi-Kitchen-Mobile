import { Text } from "@/components/ui/text";
import { extractPaymentInfoFromUrl, type PaymentResult } from "@/services/mobilePaymentService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

/**
 * Payment callback handler for Momo and VNPay
 * This screen is redirected to from the backend after payment completion
 * URL format: fe://payment/callback?orderId={id}&amount={amount}&status={status}&method={method}
 */
export default function PaymentCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId?: string;
    amount?: string;
    status?: string;
    method?: string;
  }>();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Build URL from params to extract payment info
        const urlParams = new URLSearchParams();
        if (params.orderId) urlParams.set("orderId", params.orderId);
        if (params.amount) urlParams.set("amount", params.amount);
        if (params.status) urlParams.set("status", params.status);
        if (params.method) urlParams.set("method", params.method);

        const mockUrl = `fe://payment/callback?${urlParams.toString()}`;
        const paymentInfo = extractPaymentInfoFromUrl(mockUrl);

        if (!paymentInfo) {
          throw new Error("No payment information received");
        }

        // Show success or failure toast
        if (paymentInfo.success) {
          Toast.show({
            type: "success",
            text1: "Thanh toán thành công",
            text2: `Đơn hàng #${paymentInfo.orderId} - ${paymentInfo.method}`,
            visibilityTime: 4000,
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Thanh toán thất bại",
            text2: `Đơn hàng #${paymentInfo.orderId}`,
            visibilityTime: 4000,
          });
        }

        // Navigate to order screen
        setTimeout(() => {
          router.replace("/(tabs)/order");
        }, 1000);
      } catch (error) {
        console.error("Payment callback error:", error);
        Toast.show({
          type: "error",
          text1: "Lỗi xử lý thanh toán",
          text2: error instanceof Error ? error.message : "Vui lòng thử lại",
        });
        
        // Redirect to order screen on error
        setTimeout(() => {
          router.replace("/(tabs)/order");
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handlePaymentCallback();
  }, [params, router]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#FF6D00" />
        <Text className="mt-4 text-center text-lg text-gray-600 dark:text-gray-300">
          Đang xử lý thanh toán...
        </Text>
      </View>
    </SafeAreaView>
  );
}
