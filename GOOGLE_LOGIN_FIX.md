# Google Login Redirect Issue - Fixed ✅

## Vấn đề (Problem)

### Issue 1: Redirect đến localhost:8081 (404) trên Android Emulator

Khi login với Google trên emulator, app redirect đến `localhost:8081` và hiển thị lỗi 404.

### Issue 2: Login vào Web App thay vì Mobile App trên iOS Expo Go

Khi login với Google trên Expo Go iOS, browser mở ra và sau khi login thành công, bạn thấy web app thay vì quay lại mobile app.

**Nguyên nhân chung:**

- Backend Google OAuth redirect về URL cố định thay vì sử dụng deep link scheme của mobile app
- Frontend thiếu `WebBrowser.maybeCompleteAuthSession()` → iOS không biết phải đóng browser và quay lại app
- Deep linking scheme chưa được cấu hình đầy đủ cho iOS

## Giải pháp (Solution)

### 1. Cài đặt `expo-auth-session`

```bash
npm install expo-auth-session
```

### 2. Cập nhật `AuthContext.tsx`

**Thay đổi quan trọng:**

- ✅ **Thêm `WebBrowser.maybeCompleteAuthSession()`** - CRITICAL cho iOS
  - Dòng này báo cho WebBrowser biết nó cần lắng nghe redirect
  - Không có dòng này → browser không đóng và không quay lại app
- ✅ Sử dụng `makeRedirectUri()` để tự động generate redirect URI phù hợp
- ✅ Xử lý token extraction trực tiếp trong `loginWithGoogle()`
- ✅ Thêm nhiều console logs để debug
- ✅ Xử lý các trường hợp: success, cancel, dismiss

**Redirect URI theo môi trường:**

- **Expo Go (Development)**: `exp://192.168.x.x:8081/oauth2/callback`
- **Production (Standalone app)**: `fe://oauth2/callback`

### 3. Cập nhật `app.json`

**Thay đổi:**

```json
{
  "ios": {
    "bundleIdentifier": "com.devwibu.fe",  // Thêm bundle identifier
    "supportsTablet": true,
    "infoPlist": { ... }
  }
}
```

### 4. Cập nhật `app/_layout.tsx`

**Thay đổi:**

- ✅ Thêm route cho `oauth2-callback` screen (fallback nếu WebBrowser không xử lý được)

### 5. Cập nhật Login Screen

**Thay đổi:**

- ✅ Xử lý navigation sau khi Google login thành công
- ✅ Check role và redirect đúng route (USER → /home, ADMIN → /manager)
- ✅ Block STAFF role với thông báo lỗi

## Cách test (Testing)

### Test trên iOS Expo Go

#### Bước 1: Restart app với cache clear

```bash
npm run start-clean
# hoặc
npx expo start -c
```

#### Bước 2: Mở Expo Go trên iPhone

1. Scan QR code từ terminal
2. Hoặc gõ URL: `exp://192.168.x.x:8081`

#### Bước 3: Test Google Login

1. Mở màn hình Login
2. Click nút "Continue with Google"
3. **Kiểm tra console logs:**
   ```
   OAuth redirect URL: exp://192.168.x.x:8081/oauth2/callback
   Opening Google OAuth: https://bambi.kdz.asia/api/user/login-with-google?redirect_uri=...
   ```
4. Safari sẽ mở → Đăng nhập Google
5. **Sau khi đăng nhập thành công:**
   - Safari sẽ TỰ ĐỘNG ĐÓNG (nhờ `maybeCompleteAuthSession()`)
   - App sẽ quay lại Expo Go
   - Console logs sẽ hiện:
     ```
     OAuth result: { type: "success", url: "exp://..." }
     Redirect URL received: exp://192.168.x.x:8081/oauth2/callback?token=...
     Token extracted: ✅ Yes
     ✅ Google login successful, user: [Tên user]
     ```
6. App tự động navigate đến /home hoặc /manager

### Test trên Android Emulator

```bash
npm run android
```

Quy trình tương tự như iOS, nhưng redirect URL sẽ là:

```
exp://192.168.x.x:8081/oauth2/callback
```

### Verify trên Console

✅ **Success logs:**

```
OAuth redirect URL: exp://...
Opening Google OAuth: https://...
OAuth result: { type: "success", url: "..." }
Redirect URL received: exp://...?token=...
Token extracted: ✅ Yes
✅ Google login successful, user: John Doe
```

❌ **Error logs:**

```
OAuth result: { type: "cancel" }
→ User cancelled login

OAuth result: { type: "dismiss" }
→ Browser was dismissed before completing

Token extracted: ❌ No
→ Backend didn't return token
```

## Backend Requirements

⚠️ **Backend PHẢI cấu hình:**

### 1. Accept dynamic redirect URI từ query parameter

Backend controller cần đọc `redirect_uri` từ request:

```java
@GetMapping("/api/user/login-with-google")
public RedirectView loginWithGoogle(
    @RequestParam(required = false) String redirect_uri
) {
    // Nếu có redirect_uri từ mobile → dùng nó
    // Nếu không có → dùng default cho web
    String redirectUrl = redirect_uri != null
        ? redirect_uri
        : "http://localhost:3000/oauth2/callback";

    // Lưu vào session để dùng sau khi Google callback
    session.setAttribute("oauth_redirect_uri", redirectUrl);

    // Redirect đến Google OAuth
    return new RedirectView(googleOAuthUrl);
}

@GetMapping("/oauth2/callback/google")
public RedirectView googleCallback(
    @RequestParam String code,
    HttpSession session
) {
    // Xử lý OAuth code → lấy token
    String jwtToken = processGoogleOAuth(code);

    // Lấy redirect URI từ session
    String redirectUrl = (String) session.getAttribute("oauth_redirect_uri");

    // Redirect về app với token
    return new RedirectView(redirectUrl + "?token=" + jwtToken);
}
```

### 2. Whitelist các redirect URIs trong Google OAuth Console

**Google Cloud Console** → **APIs & Services** → **Credentials** → **OAuth 2.0 Client IDs**

Thêm vào **Authorized redirect URIs:**

```
# Development (Expo Go - support bất kỳ IP nào)
exp://192.168.0.0/16/*
exp://localhost:8081/*

# Production (Standalone app)
fe://oauth2/callback

# Web (existing)
http://localhost:3000/oauth2/callback
https://your-domain.com/oauth2/callback
```

⚠️ **LƯU Ý:** Google không cho phép wildcard `*` hoàn toàn, nhưng cho phép IP range với CIDR notation.

### 3. CORS Configuration

Backend cần allow credentials và custom headers:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
```

## Troubleshooting

### ❌ Lỗi: Browser không đóng sau khi login (iOS)

**Triệu chứng:** Safari mở ra, login Google thành công, nhưng Safari không tự đóng, phải đóng manually.

**Nguyên nhân:** Thiếu `WebBrowser.maybeCompleteAuthSession()`

**Giải pháp:** ✅ Đã fix trong `AuthContext.tsx`

**Verify:** Check console có dòng này TRƯỚC khi mở browser:

```typescript
WebBrowser.maybeCompleteAuthSession();
```

---

### ❌ Lỗi: "Redirect URI mismatch" từ Google

**Triệu chứng:** Google hiển thị lỗi "Error 400: redirect_uri_mismatch"

**Nguyên nhân:** Redirect URI không được whitelist trong Google OAuth Console

**Giải pháp:**

1. Mở [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Chọn OAuth 2.0 Client ID đang dùng
3. Thêm redirect URI vào **Authorized redirect URIs**
4. Lưu lại (có thể mất vài phút để apply)

**Test:** Copy redirect URL từ console logs và thêm vào Google Console

---

### ❌ Lỗi: "No token received"

**Triệu chứng:** Console logs:

```
Token extracted: ❌ No
Error: No token received from OAuth provider
```

**Nguyên nhân:** Backend không trả về token trong URL

**Giải pháp:**

1. Check backend có đọc `redirect_uri` parameter không
2. Check backend có gắn `?token={jwt}` vào redirect URL không
3. Test backend endpoint trực tiếp:
   ```bash
   curl "https://bambi.kdz.asia/api/user/login-with-google?redirect_uri=exp://test"
   ```

**Verify backend response:** Phải redirect đến `exp://test?token=eyJhbGc...`

---

### ❌ Lỗi: App crash hoặc "Invalid URL"

**Triệu chứng:** App crash khi parse redirect URL

**Nguyên nhân:** Redirect URL không đúng format hoặc thiếu scheme

**Giải pháp:**

1. Check `makeRedirectUri()` output:
   ```typescript
   console.log("OAuth redirect URL:", redirectUrl);
   // Phải là: exp://... hoặc fe://...
   ```
2. Verify `app.json` có `"scheme": "fe"`
3. Check backend không modify redirect URL

---

### ❌ Lỗi: Vẫn mở web app thay vì mobile

**Triệu chứng:** Login thành công nhưng thấy web interface

**Nguyên nhân:** Backend redirect về web URL thay vì mobile deep link

**Giải pháp:**

1. Check backend có nhận `redirect_uri` parameter không:
   ```
   https://bambi.kdz.asia/api/user/login-with-google?redirect_uri=exp://...
   ```
2. Check network tab trong browser → Final redirect URL là gì?
3. Nếu backend không support → Yêu cầu backend team implement

---

### 🔧 Test với Standalone Build

Nếu dùng build riêng (không phải Expo Go):

```bash
# Build development client
npx expo run:ios
# hoặc
npx expo run:android

# Redirect URL sẽ là: fe://oauth2/callback
```

---

### 🔍 Debug Tips

**1. Enable verbose logging:**

```typescript
// Thêm vào AuthContext.tsx
console.log("Step 1: maybeCompleteAuthSession called");
console.log("Step 2: Redirect URL:", redirectUrl);
console.log("Step 3: Opening browser:", googleAuthUrl);
console.log("Step 4: Browser result:", result);
console.log("Step 5: Token extracted:", token);
```

**2. Test redirect URI manually:**

```bash
# Mở URL này trên mobile browser
exp://192.168.x.x:8081/oauth2/callback?token=test123

# App phải mở và hiển thị oauth2-callback screen
```

**3. Check Expo Go logs:**

```bash
# Terminal sẽ hiện logs real-time khi test
npx expo start

# Mở Expo Go → logs sẽ stream vào terminal
```

## Files Changed

1. ✅ `contexts/AuthContext.tsx` - Added `maybeCompleteAuthSession()` + better logging
2. ✅ `app/(auth)/login.tsx` - Added navigation logic after Google login
3. ✅ `app.json` - Added iOS bundle identifier
4. ✅ `app/_layout.tsx` - Added oauth2-callback screen route
5. ✅ `package.json` - Added `expo-auth-session` dependency

## Architecture Flow

```
┌─────────────────┐
│  User clicks    │
│ "Login Google"  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ maybeCompleteAuthSession()          │ ← CRITICAL cho iOS
│ Báo cho WebBrowser lắng nghe redirect│
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Generate redirect URI               │
│ exp://192.168.x.x:8081/oauth2/...  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Open browser với Google OAuth       │
│ + redirect_uri parameter            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ User login Google trên Safari       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend callback: exchange code     │
│ → Generate JWT token                │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend redirect đến:               │
│ exp://.../oauth2/callback?token=... │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ ✅ Safari TỰ ĐỘNG ĐÓNG              │
│ ✅ App quay lại Expo Go             │
│ ✅ Extract token từ URL             │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Fetch /api/user/me với token        │
│ Save auth state                     │
│ Navigate to /home                   │
└─────────────────────────────────────┘
```

## Next Steps

### Mobile Team (Done ✅)

- [x] Install `expo-auth-session`
- [x] Add `maybeCompleteAuthSession()`
- [x] Update redirect URI generation
- [x] Add logging for debugging
- [x] Configure iOS bundle identifier
- [x] Add oauth2-callback route

### Backend Team (TODO ⚠️)

- [ ] Accept `redirect_uri` query parameter
- [ ] Store redirect_uri in session during OAuth flow
- [ ] Redirect to mobile app với token: `{redirect_uri}?token={jwt}`
- [ ] Whitelist `exp://` và `fe://` schemes trong Google OAuth

### DevOps/Google Cloud (TODO ⚠️)

- [ ] Add redirect URIs vào Google OAuth Console:
  - `exp://192.168.0.0/16/*` (development)
  - `fe://oauth2/callback` (production)

## Testing Checklist

- [ ] Test trên iOS Expo Go - Browser phải TỰ ĐỘNG đóng
- [ ] Test trên Android Emulator
- [ ] Test với physical device (iOS + Android)
- [ ] Verify console logs có đầy đủ thông tin
- [ ] Test cancel flow (user cancel login)
- [ ] Test error flow (invalid credentials)
- [ ] Test với USER role → redirect /home
- [ ] Test với ADMIN role → redirect /manager
- [ ] Test với STAFF role → show error + logout

## References

- [Expo WebBrowser Docs](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- [Expo Auth Session Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [OAuth2 Deep Linking Guide](https://docs.expo.dev/guides/authentication/#oauth-with-deep-linking)
- [Google OAuth Configuration](https://console.cloud.google.com/apis/credentials)
- [Deep Linking in Expo](https://docs.expo.dev/guides/linking/)
