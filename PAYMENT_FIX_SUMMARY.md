# Payment Callback Redirection Fix - Summary

**Date**: November 13, 2025  
**Issue**: Payment callbacks (VNPAY, MOMO) and OAuth redirecting to `localhost:8080` instead of mobile app deep link `fe://`

## Root Cause

The `mobile.url` property in `application.properties` was set to `http://localhost:8081` (Expo dev server) instead of the mobile deep link scheme `fe://`.

## Changes Made

### Backend (BE/src/main/resources/application.properties)

**BEFORE:**

```properties
mobile.url=http://localhost:8081
```

**AFTER:**

```properties
mobile.url=fe://
```

### What This Fixes

1. **MOMO Payment Callbacks**: Will now redirect to `fe://payment/callback?orderId=X&amount=Y&status=SUCCESS&method=MOMO`
2. **VNPAY Payment Callbacks**: Will now redirect to `fe://payment/callback?orderId=X&amount=Y&status=SUCCESS&method=VNPAY`
3. **Google OAuth Login**: Will now redirect to `fe://oauth2/callback?token={jwt}`

## How It Works

### User-Agent Detection Pattern

The backend checks the `User-Agent` header from the HTTP request:

```java
private String getRedirectBaseUrl(HttpServletRequest request) {
    String userAgent = request.getHeader("User-Agent");
    String redirectUri = frontendUrl; // default to web (localhost:3000)

    if (userAgent != null) {
        String ua = userAgent.toLowerCase();
        // expo-web-browser sends "okhttp" on Android
        if (ua.contains("okhttp") || ua.contains("android")) {
            redirectUri = mobileUrl; // Use fe://
        }
    }

    return redirectUri;
}
```

### Payment Flow (After Fix)

```
Mobile App (expo-web-browser)
    ↓ User-Agent: okhttp/...
Backend Payment Gateway (MOMO/VNPAY)
    ↓ User completes payment
Backend /api/payment/momo-return or /vnpay-return
    ↓ Detects User-Agent = "okhttp"
    ↓ Uses mobile.url (fe://) instead of frontend.url
Redirect: fe://payment/callback?orderId=123&status=SUCCESS
    ↓
Mobile App receives callback ✅
    ↓
app/payment/callback.tsx processes result
    ↓
Shows toast & navigates to /(tabs)/order
```

## Testing Checklist

### Prerequisites

- [ ] Restart Spring Boot backend (to reload `application.properties`)
- [ ] Use Android device or emulator (iOS may have different User-Agent)
- [ ] Ensure frontend is running (`npm start` in FE directory)

### Test Cases

#### 1. MOMO Payment

- [ ] Open app on Android
- [ ] Add items to cart
- [ ] Select "Momo" payment method
- [ ] Click "Place Order"
- [ ] Complete payment in MOMO in-app browser
- [ ] **Expected**: App shows success toast and navigates to Orders tab
- [ ] **Verify URL**: Check logs for `fe://payment/callback?orderId=...&method=MOMO`

#### 2. VNPAY Payment

- [ ] Open app on Android
- [ ] Add items to cart
- [ ] Select "VNPay" payment method
- [ ] Click "Place Order"
- [ ] Complete payment in VNPAY in-app browser
- [ ] **Expected**: App shows success toast and navigates to Orders tab
- [ ] **Verify URL**: Check logs for `fe://payment/callback?orderId=...&method=VNPAY`

#### 3. Google OAuth Login

- [ ] Open app on Android
- [ ] Tap "Login with Google"
- [ ] Complete Google sign-in
- [ ] **Expected**: App receives JWT token and navigates to home
- [ ] **Verify URL**: Check logs for `fe://oauth2/callback?token=...`

#### 4. Payment Cancellation

- [ ] Start payment flow
- [ ] Cancel in payment browser
- [ ] **Expected**: App shows "Payment cancelled" toast
- [ ] **Verify**: Cart is NOT cleared (user can retry)

#### 5. Web Frontend (Should Still Work)

- [ ] Open `http://localhost:3000` in Chrome
- [ ] Test MOMO/VNPAY payment
- [ ] **Expected**: Redirects to `http://localhost:3000/payment/callback`
- [ ] **Note**: User-Agent from Chrome ≠ "okhttp", so uses `frontend.url`

### Debugging Tips

#### Check User-Agent Header

Add logging in PaymentController to verify User-Agent detection:

```java
System.out.println("User-Agent: " + request.getHeader("User-Agent"));
System.out.println("Redirect URL: " + redirectUrl);
```

**Expected Output (Mobile)**:

```
User-Agent: okhttp/4.12.0
Redirect URL: fe://payment/callback?orderId=123&status=SUCCESS&method=MOMO
```

**Expected Output (Web)**:

```
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/...
Redirect URL: http://localhost:3000/payment/callback?orderId=123&status=SUCCESS&method=MOMO
```

#### Check Frontend Logs

In Metro bundler, you should see:

```
[processPayment] Opening payment URL: https://test-payment.momo.vn/...
[processPayment] Payment result: { success: true, orderId: "123", status: "SUCCESS", method: "MOMO" }
```

#### Common Issues

| Issue                             | Cause                          | Solution                                      |
| --------------------------------- | ------------------------------ | --------------------------------------------- |
| Still redirects to localhost:8080 | Backend not restarted          | Restart Spring Boot to reload properties      |
| "Invalid URL" error               | User-Agent not "okhttp"        | Check if using expo-web-browser (not Linking) |
| Deep link not opening app         | App not registered for `fe://` | Check `app.json` has `"scheme": "fe"`         |
| Web version broken                | Always using mobile.url        | Check User-Agent detection logic              |

## Configuration Reference

### Backend Configuration (application.properties)

```properties
# Frontend URLs
frontend.url=http://localhost:3000 # Web app (default redirect)
mobile.url=fe://                   # Mobile deep link (when User-Agent = okhttp)
```

### Frontend Configuration (app.json)

```json
{
  "expo": {
    "scheme": "fe",
    "ios": {
      "bundleIdentifier": "com.devwibu.fe"
    },
    "android": {
      "package": "com.devwibu.FE"
    }
  }
}
```

### Deep Link URL Patterns

- Payment: `fe://payment/callback`
- OAuth: `fe://oauth2/callback`

## Production Deployment Notes

For production deployment, update `application.properties`:

```properties
# Production URLs
frontend.url=https://your-web-app.com
mobile.url=fe://

# Payment callback URLs must match
momo.redirect-url=https://your-backend.com/api/payment/momo-return
vnpay.return-url=https://your-backend.com/api/payment/vnpay-return
```

**Important**: The payment gateway (MOMO/VNPAY) will call the backend return URL, which then redirects to `fe://` for mobile or web URL based on User-Agent.

## Related Files

### Backend

- `BE/src/main/java/gr1/fpt/bambikitchen/controller/PaymentController.java` - Payment callback handlers
- `BE/src/main/java/gr1/fpt/bambikitchen/security/google/OAuth2AuthenticationSuccessHandler.java` - OAuth callback handler (same pattern)
- `BE/src/main/resources/application.properties` - Configuration ⚠️ MODIFIED

### Frontend

- `FE/services/mobilePaymentService.ts` - WebBrowser payment handling
- `FE/app/payment/callback.tsx` - Payment result screen
- `FE/app/oauth2-callback.tsx` - OAuth callback screen
- `FE/app.json` - Deep link scheme configuration

## Verification

After restarting the backend, verify the configuration was loaded:

```bash
# Check backend logs for:
# mobile.url=fe://
# frontend.url=http://localhost:3000
```

Test both mobile and web to ensure both work correctly.
