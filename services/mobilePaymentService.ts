import * as WebBrowser from "expo-web-browser";

/**
 * Mobile Payment Service
 * Handles Momo and VNPay payment flows using expo-web-browser
 * Similar to Google OAuth implementation
 */

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  amount?: string;
  status?: string;
  method?: string;
  error?: string;
}

/**
 * Prepares the WebBrowser for payment session
 * Should be called before opening the payment session
 */
export const preparePaymentBrowser = () => {
  WebBrowser.maybeCompleteAuthSession();
};

/**
 * Opens a payment URL (Momo/VNPay) in expo-web-browser
 * This allows proper redirect back to the mobile app
 *
 * @param paymentUrl - The payment URL from backend
 * @param redirectUrl - The redirect URI for callback (should be fe://payment/callback)
 * @returns WebBrowser result
 */
export const openPaymentSession = async (
  paymentUrl: string,
  redirectUrl: string
): Promise<WebBrowser.WebBrowserAuthSessionResult> => {
  console.log("🌐 Opening payment session...");
  console.log("Payment URL:", paymentUrl);
  console.log("Redirect URL:", redirectUrl);

  const result = await WebBrowser.openAuthSessionAsync(paymentUrl, redirectUrl, {
    showInRecents: true,
    createTask: false,
  });

  console.log("📱 Payment result type:", result.type);
  return result;
};

/**
 * Extracts payment info from redirect URL
 * @param url - The redirect URL containing payment result
 * @returns Payment information or null
 */
export const extractPaymentInfoFromUrl = (url: string): PaymentResult | null => {
  try {
    console.log("🔍 Extracting payment info from URL:", url);

    const urlObj = new URL(url);
    const orderId = urlObj.searchParams.get("orderId");
    const amount = urlObj.searchParams.get("amount");
    const status = urlObj.searchParams.get("status");
    const method = urlObj.searchParams.get("method");

    if (!orderId || !status || !method) {
      console.error("❌ Missing required payment parameters");
      return null;
    }

    const paymentInfo: PaymentResult = {
      success: status === "SUCCESS",
      orderId,
      amount: amount || "0",
      status,
      method,
    };

    console.log("✅ Payment info extracted:", paymentInfo);
    return paymentInfo;
  } catch (error) {
    console.error("❌ Failed to extract payment info:", error);
    return null;
  }
};

/**
 * Main payment function for Momo/VNPay
 * Opens payment in browser and handles the redirect
 *
 * @param paymentUrl - The payment URL from createOrder response
 * @returns PaymentResult with success status and payment info
 */
export const processPayment = async (paymentUrl: string): Promise<PaymentResult> => {
  try {
    // Step 1: Prepare WebBrowser
    preparePaymentBrowser();

    // Step 2: Define redirect URI (must match backend configuration)
    const redirectUrl = "fe://payment/callback";

    // Step 3: Open payment session in browser
    const result = await openPaymentSession(paymentUrl, redirectUrl);

    // Step 4: Handle different result types
    if (result.type === "success") {
      if (!result.url) {
        console.error("❌ Success result but no URL");
        return {
          success: false,
          error: "No redirect URL received",
        };
      }

      // Step 5: Extract payment info from redirect URL
      const paymentInfo = extractPaymentInfoFromUrl(result.url);

      if (!paymentInfo) {
        return {
          success: false,
          error: "Failed to extract payment information",
        };
      }

      console.log("🎉 Payment process completed!");
      return paymentInfo;
    } else if (result.type === "cancel") {
      console.log("⚠️ User cancelled payment");
      return {
        success: false,
        error: "Payment was cancelled",
      };
    } else if (result.type === "dismiss") {
      console.log("⚠️ Browser was dismissed");
      return {
        success: false,
        error: "Browser was dismissed",
      };
    } else if (result.type === "locked") {
      console.log("⚠️ Another payment session is in progress");
      return {
        success: false,
        error: "Another payment is in progress",
      };
    }

    return {
      success: false,
      error: "Payment failed - unknown result type",
    };
  } catch (error) {
    console.error("❌ Payment process error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Warm up the browser for faster payment (optional optimization)
 */
export const warmUpPaymentBrowser = async (): Promise<void> => {
  try {
    await WebBrowser.warmUpAsync();
    console.log("✅ Payment browser warmed up");
  } catch (error) {
    console.warn("⚠️ Failed to warm up browser:", error);
  }
};

/**
 * Cool down the browser after payment (cleanup)
 */
export const coolDownPaymentBrowser = async (): Promise<void> => {
  try {
    await WebBrowser.coolDownAsync();
    console.log("✅ Payment browser cooled down");
  } catch (error) {
    console.warn("⚠️ Failed to cool down browser:", error);
  }
};
