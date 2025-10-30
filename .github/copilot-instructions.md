# React Native Expo Restaurant App - AI Agent Guide

## Quick Reference

**Start here**: Run `npm run generate-schema` if backend changed → create service hook in `services/` → use `$api.useQuery()` or `$api.useMutation()` in components.

**Common commands**:
- `npm start` - Start Metro bundler
- `npm run android` - Run on Android (emulator or device)
- `npm run generate-schema` - Sync types from backend OpenAPI
- `npm run start-clean` - Clear cache (fix Zustand/React Query issues)

**File patterns**:
- API: `services/[entity]Service.ts` exports `use[Entity]` hooks
- Screens: `app/(tabs)/[feature]/index.tsx` auto-registers routes
- State: Zustand stores in `stores/` with AsyncStorage persistence
- Types: Auto-generated in `schema-from-be.d.ts` (never edit manually)

**Key constraints**:
- Mobile is USER-role only (ADMIN/STAFF blocked in `app/(tabs)/_layout.tsx`)
- Auth uses JWT in `Authorization: Bearer` header (auto-injected via `libs/api.ts` middleware)
- No `fetch()` calls except in `AuthContext.tsx` (use `$api` hooks instead)

## Architecture Overview

**Tech Stack**: Expo 54 + React Native 0.81 + TypeScript + NativeWind (Tailwind) + React Query + Zustand  
**Backend**: Spring Boot REST API at `https://bambi.kdz.asia` with JWT authentication  
**Target**: Mobile-only app for USER role (ADMIN/STAFF use web interface)

### Critical Design Decisions

1. **Dual Auth Architecture**: JWT tokens (from `/api/user/login`) stored in Zustand + token injected via middleware in `libs/api.ts`
2. **Mobile-Only Restriction**: Users with ADMIN/STAFF roles are blocked at `app/(tabs)/_layout.tsx` and redirected to web app
3. **Type-Safe API**: Backend OpenAPI spec auto-generates TypeScript types via `npm run generate-schema` → `schema-from-be.d.ts`
4. **File-Based Routing**: Expo Router with layout groups: `(auth)`, `(onboarding)`, `(tabs)` represent auth flow, onboarding flow, and main app sections

## Development Workflow

```bash
# Type generation (run after backend schema changes)
npm run generate-schema  # Fetches from https://bambi.kdz.asia/v3/api-docs

# Development
npm start                # Start with Metro bundler
npm run start-clean      # Clear cache if React Query/Zustand behaves oddly
npm run android          # Android emulator (push notifications work)
npm run ios              # iOS simulator (push notifications require physical device)

# Code Quality
npm run typecheck        # TypeScript validation
npm run lint             # ESLint (includes Prettier via plugin)
npm run format           # Auto-fix formatting
```

**Common Issues**:
- If auth breaks: Clear AsyncStorage (check `stores/persistStorage.ts`) or use `npm run start-clean`
- Backend CORS errors: Backend must allow credentials + custom headers for JWT auth
- Push notifications: Android emulator works, iOS requires physical device or Expo Go

## Code Patterns You Must Follow

### 1. API Integration (Service Layer)

**NEVER** write raw `fetch()` calls except in `contexts/AuthContext.tsx` (login/register endpoints don't use standard middleware).

```typescript
// ✅ CORRECT: Use openapi-react-query hooks from service files
// services/dishService.ts
export const useDishes = () => {
  return $api.useQuery("get", "/api/dish");
};

export const useCreateDish = () => {
  return $api.useMutation("post", "/api/dish");
};

// ✅ CORRECT: Transform functions standardize request/response shapes
export const transformDishCreateRequest = (data: FormData): DishCreateRequest => ({
  name: data.name,
  price: data.price,
  // ... map form fields to backend schema
});
```

**Pattern**: Every backend endpoint gets:
1. `use[EntityName]` query hook (GET)
2. `useCreate[EntityName]` mutation hook (POST)
3. `useUpdate[EntityName]` mutation hook (PUT)
4. `useDelete[EntityName]` mutation hook (DELETE)
5. `transform[EntityName][Action]Request` helper functions

### 2. State Management

**Server State** → React Query (via `$api` hooks)  
**Client State** → Zustand with persistence (via `stores/`)

```typescript
// ✅ CORRECT: Zustand store structure (see stores/cartStore.ts)
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({ /* immutable update */ })),
      getTotalPrice: () => get().items.reduce(...), // Derived state as function
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(getPersistStorage), // Uses AsyncStorage wrapper
    }
  )
);
```

**Cache Invalidation**: After mutations, always invalidate React Query cache:
```typescript
// ❌ WRONG: Hook exists but useMutationHandler.ts is empty - don't use it
// ✅ CORRECT: Manual invalidation pattern used in codebase
const createMutation = useCreateDish();
await createMutation.mutateAsync({ body: data });
queryClient.invalidateQueries({ queryKey: ["get", "/api/dish"] }); // Match openapi-react-query format
```

### 3. Authentication Flow

**Login** → JWT token from `/api/user/login` → stored in Zustand → middleware injects into headers

```typescript
// libs/api.ts middleware (already implemented)
fetchClient.use({
  async onRequest({ request }) {
    const token = useAuthStore.getState().token;
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
});
```

**Role-Based Routing**: Check `utils/roleNavigation.ts` before adding navigation logic.  
**Mobile Restriction**: `app/(tabs)/_layout.tsx` enforces USER-only access—do not bypass this.

### 4. Styling with NativeWind

Use Tailwind classes directly on React Native components:

```tsx
// ✅ CORRECT: NativeWind classes work on View, Text, Pressable, etc.
<View className="flex-1 bg-white dark:bg-gray-900 px-6">
  <Text className="text-3xl font-bold text-[#000000] dark:text-white">
    Login
  </Text>
  <Button className="rounded-3xl bg-[#FF6D00] active:bg-[#FF4D00]">
    <Text className="text-white font-bold">Submit</Text>
  </Button>
</View>
```

**Design System**:
- Primary Orange: `#FF6D00` (buttons, links, active states)
- Active/Gradient: `#FF4D00` for hover/press states
- Gray labels: `#757575` for form labels
- Dark mode: Use `dark:` prefix (theme auto-switches based on system)

**UI Components**: Use RN Primitives from `components/ui/` (shadcn-style components). Check `components.json` for available primitives.

### 5. Form Handling

**Package installed but not used**: `react-hook-form` is in `package.json` but forms currently use controlled components with React state:

```tsx
// ✅ CURRENT PATTERN (see app/(auth)/login.tsx)
const [phone, setPhone] = useState("");
const [password, setPassword] = useState("");

const handleSubmit = async () => {
  // 1. Validate
  if (!validatePhone(phone)) {
    Toast.show({ type: "error", text1: "Invalid phone number" });
    return;
  }
  
  // 2. Transform data
  const authData = await login(phone, password);
  
  // 3. Navigate on success
  router.replace("/home");
};
```

**Validation**: Inline validation functions (see `validatePhone` in login screen). Backend errors caught in try/catch.

**Phone Number Normalization** (Critical Pattern):
```typescript
// AuthContext.tsx normalizes phone inputs automatically
const normalizeIdentifier = (identifier: string) => {
  const trimmed = identifier.trim();
  if (/^\+84\d+$/.test(trimmed)) {
    return `0${trimmed.slice(3)}`; // Convert +84 to 0 prefix
  }
  return trimmed;
};
```

### 6. Push Notifications

**Auto-registration**: `hooks/usePushNotifications.ts` registers tokens when user logs in.  
**Backend Requirement**: Backend must use Expo Push API (not Firebase SDK directly)—see `BACKEND_PUSH_NOTIFICATION_ANALYSIS.md`.

```typescript
// ✅ AUTOMATIC: Hook handles token registration
const { expoPushToken, isRegistered } = usePushNotifications();
// Token auto-sends to /api/notification/device on user login

// ✅ LOCAL TESTING: Schedule test notifications
import { scheduleLocalNotification } from "@/services/pushNotificationService";
await scheduleLocalNotification({ title: "Test", body: "Works!" }, 5);
```

**Testing**: Use Android emulator or physical iOS device. Expo Push Tool: `https://expo.dev/notifications`

## Project Structure

```
app/                     # File-based routing (Expo Router)
├── _layout.tsx          # Root layout (providers wrap here)
├── index.tsx            # Entry point (checks auth → redirects)
├── (auth)/              # Auth flow: login, register, forgot-password
├── (onboarding)/        # First-time user flow: welcome → intro-1/2/3
└── (tabs)/              # Main app (tab navigation for USER role)
    ├── home/            # Home screen
    ├── menu/            # Menu browsing
    ├── order/           # Order history
    ├── profile/         # User profile
    └── cart/            # Shopping cart

components/              # Reusable components
├── ui/                  # RN Primitives (shadcn-style)
└── CustomTabBar.tsx     # Custom tab bar with hiddenRoutes prop

contexts/                # React contexts (wrap in _layout.tsx)
├── AuthContext.tsx      # Auth provider (login/logout/register logic)
├── QueryProvider.tsx    # React Query client wrapper
└── ThemeContext.tsx     # Dark mode toggle

hooks/                   # Custom hooks
├── useAuth.ts           # Auth context consumer
└── usePushNotifications.ts  # Auto-registers push tokens

interfaces/              # TypeScript interfaces (match backend DTOs)
libs/                    # Core utilities
├── api.ts               # OpenAPI fetch client + React Query setup
└── theme.ts             # Navigation theme (light/dark)

services/                # API integration layer (use[Entity] hooks)
stores/                  # Zustand stores (authStore, cartStore, themeStore)
```

## Key Files to Reference

- **API Setup**: `libs/api.ts` (shows middleware pattern)
- **Auth Flow**: `contexts/AuthContext.tsx` (login/register/logout implementation)
- **Role Enforcement**: `app/(tabs)/_layout.tsx` (mobile-only USER access)
- **Service Pattern**: `services/dishService.ts` (canonical CRUD hook structure)
- **Manager CRUD**: `app/manager/discounts/index.tsx` (list + create/update/delete pattern)
- **Type Safety**: `schema-from-be.d.ts` (auto-generated, never edit manually)

## Common Tasks

### Adding a New Feature

1. **Generate types**: `npm run generate-schema` (if backend changed)
2. **Create interface**: Add to `interfaces/` (e.g., `dish.interface.ts`)
3. **Create service**: Add hooks to `services/` (e.g., `dishService.ts`)
4. **Create screen**: Add to `app/` (file-based routing auto-registers)
5. **Update navigation**: Modify `app/(tabs)/_layout.tsx` if adding tabs

### Adding a New API Endpoint

```typescript
// 1. Run schema generation (updates schema-from-be.d.ts from backend)
npm run generate-schema

// 2. Create service hook in services/[entity]Service.ts
export const useGetDishes = () => {
  return $api.useQuery("get", "/api/dish");
};

// 3. Optional: Add transform helpers for complex request/response shapes
export const transformDishCreateRequest = (formData: any) => ({
  name: formData.name,
  price: Number(formData.price),
  // ... map frontend form to backend DTO
});

// 4. Use in component
const { data: dishes, isLoading } = useGetDishes();
```

### Role Extraction Pattern (Critical)

Backend sends roles as array of objects with `authority` property. Always use `extractRole` helper:

```typescript
// ✅ CORRECT: From accountService.ts
export const extractRole = (roles: any[]): ROLE_TYPE => {
  if (!roles || roles.length === 0) return ROLES.USER;
  
  // Handle different formats: "USER" or {authority: "ROLE_USER"}
  const roleStr = typeof roles[0] === "string" 
    ? roles[0] 
    : roles[0]?.authority || roles[0]?.role || "USER";
  
  // Remove ROLE_ prefix if present
  const cleanRole = roleStr.replace("ROLE_", "");
  return (cleanRole.toUpperCase() as ROLE_TYPE) || ROLES.USER;
};
```

### Debugging Auth Issues

1. Check `stores/authStore.ts` state in Zustand DevTools
2. Verify JWT token in `libs/api.ts` middleware logs
3. Clear AsyncStorage: `npm run start-clean` or manually via code
4. Check backend CORS allows `Authorization` header + credentials

### Testing Push Notifications

1. **Android**: Run `npm run android` (works on emulator)
2. **iOS**: Use physical device or Expo Go app (simulator doesn't support push)
3. **Get token**: Check logs or use `usePushNotifications` hook
4. **Send test**: https://expo.dev/notifications (paste token)
5. **Backend integration**: Ensure backend uses Expo Push API (not Firebase directly)

## Don'ts

❌ **Never** bypass role checks in `app/(tabs)/_layout.tsx`  
❌ **Never** edit `schema-from-be.d.ts` manually (auto-generated)  
❌ **Never** use `fetch()` directly except in `AuthContext.tsx` (login/register don't use JWT middleware)
❌ **Never** use `useMutationHandler` hook (file exists but is empty - use direct mutation patterns)
❌ **Never** store sensitive data in AsyncStorage without encryption  
❌ **Never** navigate to manager routes from mobile app (web-only)  
❌ **Never** commit with ESLint errors (run `npm run lint` first)
❌ **Never** forget to normalize phone numbers (`+84` → `0` prefix) in auth flows

## Critical Gotchas

1. **Login endpoint quirk**: `/api/user/login` returns JWT as **plain text**, not JSON:
   ```typescript
   const response = await fetch(`${API_BASE_URL}/api/user/login`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ username: normalizedPhone, password }),
   });
   const token = await response.text(); // NOT response.json()
   ```

2. **Query key format**: openapi-react-query uses `["get", "/api/dish"]` format (method + path):
   ```typescript
   queryClient.invalidateQueries({ queryKey: ["get", "/api/dish"] });
   ```

3. **AsyncStorage rehydration**: Zustand stores set `isLoading: true` initially, wait for `onRehydrateStorage`:
   ```typescript
   onRehydrateStorage: () => (state) => {
     if (state) state.setIsLoading(false);
   }
   ```

4. **Dark mode CSS variables**: NativeWind uses HSL format in `global.css`:
   ```css
   --primary: 24 100% 52%; /* NOT #FF6D00 */
   ```

## Backend Integration Notes

- **Base URL**: `https://bambi.kdz.asia` (prod), configurable via `EXPO_PUBLIC_API_URL` env var
- **Auth**: JWT tokens from `/api/user/login` (username = phone number)
- **Session**: Stateless JWT (no server-side session management)
- **CORS**: Backend must allow `Authorization` header + `credentials: include`
- **OpenAPI**: `/v3/api-docs` endpoint for schema generation
- **Push Notifications**: Backend uses Firebase but needs Expo Push API adapter (see `BACKEND_PUSH_NOTIFICATION_ANALYSIS.md`)

## Mobile-Specific Considerations

- **Platform checks**: Use `Platform.OS` sparingly (NativeWind handles most styling)
- **Safe areas**: Always wrap screens in `SafeAreaView` from `react-native-safe-area-context`
- **Images**: Use `expo-image` (not `react-native` Image) for better performance
- **Lists**: Use `@shopify/flash-list` for long lists (if needed in future)
- **Permissions**: Camera/notification permissions configured in `app.json`
- **Dark mode**: Auto-detected via `useColorScheme()` from NativeWind

## Recent Changes (2024-2025)

- **Oct 2024**: Switched from mock auth to real JWT backend integration
- **Oct 2024**: Enforced mobile-only USER access (ADMIN/STAFF blocked)
- **Oct 2024**: Added push notification infrastructure (frontend complete, backend needs adapter)
- **Oct 2024**: Converted all UI text from Vietnamese to English
- **Oct 2024**: Standardized color scheme to orange-primary design system

## Questions to Ask Before Implementing

1. **Does the backend endpoint exist?** → Check `schema-from-be.d.ts` or run `npm run generate-schema`
2. **Is this a mobile-only feature?** → If manager feature, it's web-only (don't implement on mobile)
3. **Does this need persistence?** → Use Zustand persist if client state, React Query for server state
4. **Does this need auth?** → Check if endpoint requires JWT (most do except login/register)
5. **Is this a new screen?** → Add to `app/` directory (file-based routing)
6. **Does this need push notifications?** → Check if backend supports Expo Push API first

---

*For detailed push notification setup, see `PUSH_NOTIFICATION_README.md`. For backend integration specifics, see `copilot-instructions.md` (legacy guide). For Vietnamese documentation, check `*_VI.md` files.*
