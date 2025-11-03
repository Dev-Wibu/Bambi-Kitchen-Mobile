# Google Authentication Service

## 📚 Overview

Service này quản lý toàn bộ quy trình Google OAuth authentication cho mobile app. Tất cả logic Google login đã được tách riêng để dễ bảo trì và kiểm soát.

## 📁 File Structure

```
services/
└── googleAuthService.ts    # Google OAuth logic (tách riêng)
    ├── prepareGoogleAuth()         # Chuẩn bị WebBrowser (critical cho iOS)
    ├── generateRedirectUri()       # Tạo redirect URI
    ├── buildGoogleAuthUrl()        # Tạo Google OAuth URL
    ├── openGoogleAuthSession()     # Mở browser OAuth
    ├── extractTokenFromUrl()       # Lấy token từ URL
    ├── fetchUserInfo()             # Lấy thông tin user
    └── loginWithGoogle()           # Main function (orchestrator)
```

## 🚀 Usage

### Basic Usage (trong AuthContext)

```typescript
import { loginWithGoogle as googleAuthLogin } from "@/services/googleAuthService";

const loginWithGoogle = async () => {
  try {
    // Gọi service với setToken function
    const result = await googleAuthLogin(setToken);

    if (result.success && result.authData) {
      // Lưu auth state
      await saveAuthState(result.authData);
      console.log("✅ Google login successful:", result.authData.name);
      // Navigation sẽ được xử lý ở login screen
    } else {
      throw new Error(result.error || "Google login failed");
    }
  } catch (error) {
    console.error("❌ Google login error:", error);
    throw error;
  }
};
```

### Advanced Usage (tùy chỉnh từng bước)

```typescript
import {
  prepareGoogleAuth,
  generateRedirectUri,
  buildGoogleAuthUrl,
  openGoogleAuthSession,
  extractTokenFromUrl,
  fetchUserInfo,
} from "@/services/googleAuthService";

// Bước 1: Chuẩn bị (CRITICAL cho iOS)
prepareGoogleAuth();

// Bước 2: Tạo redirect URI
const redirectUrl = generateRedirectUri();
// Output: exp://192.168.1.49:8081/--/oauth2/callback

// Bước 3: Tạo Google OAuth URL
const authUrl = buildGoogleAuthUrl(redirectUrl);
// Output: https://bambi.kdz.asia/api/user/login-with-google?redirect_uri=...

// Bước 4: Mở browser OAuth
const result = await openGoogleAuthSession(authUrl, redirectUrl);

// Bước 5: Xử lý kết quả
if (result.type === "success" && result.url) {
  // Bước 6: Lấy token
  const token = extractTokenFromUrl(result.url);

  if (token) {
    // Bước 7: Store token
    setToken(token);

    // Bước 8: Lấy user info
    const authData = await fetchUserInfo(token);

    if (authData) {
      console.log("✅ Login success:", authData);
    }
  }
}
```

## 📊 Response Format

### GoogleAuthResult

```typescript
interface GoogleAuthResult {
  success: boolean;
  authData?: AuthLoginData; // Nếu success = true
  error?: string; // Nếu success = false
}
```

### Success Response

```typescript
{
  success: true,
  authData: {
    userId: 123,
    name: "John Doe",
    role: "USER"
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: "Google login was cancelled"
}
```

## 🔍 Console Logs

Service này có logging chi tiết để debug:

```
🚀 Starting Google login...
📍 Generated redirect URI: exp://192.168.1.49:8081/--/oauth2/callback
🔗 Google OAuth URL: https://bambi.kdz.asia/api/user/login-with-google?redirect_uri=...
🌐 Opening Google OAuth session...
📱 OAuth result type: success
🔍 Extracting token from URL: exp://192.168.1.49:8081/--/oauth2/callback?token=...
🎫 Token extracted: ✅ Yes
👤 Fetching user info...
✅ User info fetched successfully: John Doe (USER)
🎉 Google login successful!
```

## ⚙️ Configuration

### Google OAuth Config

```typescript
const GOOGLE_AUTH_CONFIG = {
  scheme: "fe", // Deep link scheme
  path: "oauth2/callback", // Callback path
  preferLocalhost: false, // Không dùng localhost trên mobile
};
```

### Redirect URI Patterns

- **Expo Go (Development)**: `exp://192.168.x.x:8081/--/oauth2/callback`
- **Standalone App (Production)**: `fe://oauth2/callback`

## 🛠️ Helper Functions

### warmUpBrowser() & coolDownBrowser()

Tối ưu hóa performance (optional):

```typescript
import { warmUpBrowser, coolDownBrowser } from "@/services/googleAuthService";

// Trước khi mở login screen
await warmUpBrowser();

// Sau khi login xong
await coolDownBrowser();
```

## 🐛 Debugging

### Test Từng Function Riêng

```typescript
// Test redirect URI generation
const uri = generateRedirectUri();
console.log("Generated URI:", uri);

// Test URL building
const authUrl = buildGoogleAuthUrl(uri);
console.log("Auth URL:", authUrl);

// Test token extraction
const testUrl = "exp://test/callback?token=abc123";
const token = extractTokenFromUrl(testUrl);
console.log("Extracted token:", token); // "abc123"
```

### Common Issues

#### ❌ Issue: "Google login was cancelled"

**Nguyên nhân**: iOS WebAuthenticationSession error 1

**Giải pháp**:

1. Check backend có redirect về `exp://` URL không
2. Check Google Cloud Console có whitelist redirect URI chưa
3. Verify `prepareGoogleAuth()` được gọi trước khi mở browser

#### ❌ Issue: "No token received"

**Nguyên nhân**: Backend không gắn token vào redirect URL

**Giải pháp**:

1. Check backend logs
2. Verify backend redirect format: `{redirect_uri}?token={jwt}`
3. Test manual: `https://bambi.kdz.asia/api/user/login-with-google?redirect_uri=exp://test`

#### ❌ Issue: "Failed to fetch user information"

**Nguyên nhân**: Token không hợp lệ hoặc `/api/user/me` endpoint lỗi

**Giải pháp**:

1. Check token trong AsyncStorage
2. Test API endpoint trực tiếp với token
3. Verify backend JWT validation logic

## 🔐 Security Notes

- **Token storage**: JWT token được lưu trong Zustand store với AsyncStorage persistence
- **Token transmission**: Token được truyền qua URL parameters (OAuth standard)
- **HTTPS required**: Backend phải dùng HTTPS (không phải HTTP)
- **Token validation**: Backend phải validate token mỗi request

## 📖 Related Documentation

- Main guide: `GOOGLE_LOGIN_FIX.md`
- Debug guide: `GOOGLE_LOGIN_DEBUG.md`
- API setup: `libs/api.ts`
- Auth context: `contexts/AuthContext.tsx`
- OAuth callback: `app/oauth2-callback.tsx`

## 🎯 Next Steps

1. ✅ Google Auth Service đã được tách riêng
2. ✅ AuthContext đã sử dụng service mới
3. ⏳ Test trên iOS device
4. ⏳ Verify backend redirect URI handling
5. ⏳ Add unit tests cho từng function

## 💡 Tips

- Luôn check console logs để debug
- Sử dụng functions riêng lẻ để test từng bước
- Warm up browser trước login screen để tăng tốc
- Cool down browser sau khi login xong để cleanup
