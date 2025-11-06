# Bambi Kitchen Mobile - AI Agent Guide

React Native Expo restaurant app with dual USER/ADMIN interfaces, type-safe backend integration, and role-based routing.

## Quick Start

**New feature workflow**: `npm run generate-schema` → create service in `services/` → use `$api.useQuery()` or `$api.useMutation()` in screens.

**Essential commands**:
- `npm run generate-schema` - **Critical**: Regenerate types from backend OpenAPI (`https://bambi.kdz.asia/v3/api-docs`) after backend changes
- `npm start` - Metro bundler (use `-c` flag if React Query/Zustand behaves oddly)
- `npm run android` / `npm run ios` - Platform-specific builds
- `npm run typecheck` - Validate TypeScript before committing
- `npm run lint` - ESLint + Prettier (auto-runs Prettier via plugin)

**File structure patterns**:
- **Services**: `services/dishService.ts` exports `useDishes()`, `useCreateDish()`, `useUpdateDish()`, etc.
- **Screens**: `app/(tabs)/menu/index.tsx` auto-registers route `/menu` via Expo Router
- **State**: Zustand stores in `stores/` with AsyncStorage persistence (see `cartStore.ts` pattern)
- **Types**: `schema-from-be.d.ts` auto-generated (**NEVER edit manually**)

**Critical constraints**:
- **Role separation**: USER → `(tabs)` routes, ADMIN → `/manager` routes, STAFF → blocked (see `app/(tabs)/_layout.tsx:15-30`)
- **Auth flow**: JWT from `/api/user/login` → stored in `authStore` → auto-injected via `libs/api.ts` middleware
- **OAuth scheme**: `fe://oauth2/callback` (configured in `app.json:6`)
- **Fetch rule**: NO raw `fetch()` except `AuthContext.tsx` (login/register don't use JWT middleware)

## Architecture

**Stack**: Expo 54 + React Native 0.81 + TypeScript + NativeWind + React Query + Zustand  
**Backend**: Spring Boot at `https://bambi.kdz.asia` with JWT auth  
**Target**: Mobile app with dual USER/ADMIN interfaces (STAFF blocked)

### Design Decisions Agents Must Understand

1. **Dual-Interface Architecture** (NOT mobile-only):
   - USER role → `app/(tabs)/` - Customer ordering interface
   - ADMIN role → `app/manager/` - Management dashboard on mobile
   - STAFF role → Blocked on mobile (`app/(tabs)/_layout.tsx:15-30`)
   
2. **Type-Safe Backend Integration**:
   - Backend OpenAPI spec → `npm run generate-schema` → `schema-from-be.d.ts` (auto-generated)
   - Service hooks wrap `$api.useQuery(method, path)` from `openapi-react-query`
   - See `services/dishService.ts` for canonical pattern

3. **JWT Auth Flow**:
   - Login → token from `/api/user/login` (plain text response, NOT JSON) → `authStore.ts`
   - Middleware in `libs/api.ts:18` auto-injects `Authorization: Bearer` header
   - Google OAuth via `services/googleAuthService.ts` (modular, 10+ helper functions)

4. **State Management Split**:
   - **Server state** → React Query (`$api` hooks invalidate via `queryClient`)
   - **Client state** → Zustand with AsyncStorage persistence (see `stores/cartStore.ts:28`)
   
5. **Provider Nesting Order** (`app/_layout.tsx:33`):
   ```
   QueryProvider → AuthProvider → ThemeProvider → NavigationThemeProvider → Screens
   ```

## Code Patterns (Enforce Strictly)

### 1. API Integration - Service Layer Pattern

**Rule**: NEVER write raw `fetch()` except in `contexts/AuthContext.tsx` (login/register endpoints bypass JWT middleware).

```typescript
// ✅ CORRECT: Service hook pattern (services/dishService.ts)
export const useDishes = () => {
  return $api.useQuery("get", "/api/dish", {});
};

export const useCreateDish = () => {
  return $api.useMutation("post", "/api/dish");
};

// ✅ Transform helpers for complex mappings
export const transformDishCreateRequest = (formData: any) => ({
  name: formData.name,
  price: Number(formData.price),
  // Map frontend form → backend DTO
});
```

**Every entity needs**:
1. `use[Entity]` - GET query hook
2. `useCreate[Entity]` - POST mutation hook  
3. `useUpdate[Entity]` - PUT mutation hook
4. `useDelete[Entity]` - DELETE mutation hook
5. `transform[Entity][Action]Request` - Data transformation helpers

**Cache invalidation** (manual, `useMutationHandler` is EMPTY):
```typescript
const createMutation = useCreateDish();
await createMutation.mutateAsync({ body: data });
queryClient.invalidateQueries({ queryKey: ["get", "/api/dish"] }); // openapi-react-query format
```

### 2. State Management - Split Pattern

**Server state** → React Query (`$api` hooks)  
**Client state** → Zustand with AsyncStorage persistence

```typescript
// ✅ Zustand store structure (stores/cartStore.ts)
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        // Auto-merge identical simple items
        const canMerge = item.dishId > 0 && !item.recipe && !item.dishTemplate;
        if (canMerge) {
          const existing = get().items.find(i => i.dishId === item.dishId);
          if (existing) {
            set({ items: get().items.map(i => 
              i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
            )});
            return;
          }
        }
        // Unique ID for customized items: ${dishId}-${timestamp}-${random}
        const uniqueKey = `${item.dishId || "custom"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set({ items: [...get().items, { ...item, id: uniqueKey }] });
      },
      // Derived state as functions (NOT stored values)
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(getPersistStorage), // AsyncStorage wrapper
    }
  )
);
```

**Cart state principles**:
- Merge identical simple items automatically
- Generate unique IDs for customized dishes
- Use derived state as **functions**, never store computed values

### 3. Authentication Flow - JWT + Google OAuth

**JWT Login** → Token from `/api/user/login` (plain text response, not JSON) → stored in Zustand → middleware injects into headers

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

**Google OAuth** → Modular service in `services/googleAuthService.ts` with 10+ helper functions:

- `loginWithGoogle(setToken)` - Main orchestrator
- `prepareGoogleAuth()` - WebBrowser setup (CRITICAL for iOS)
- `generateRedirectUri()` - Creates `fe://oauth2/callback` URI
- See `services/googleAuthExample.ts` for 6 usage patterns

**Role-Based Routing**: Check `utils/roleNavigation.ts` before adding navigation logic.  
**Mobile Restriction**: `app/(tabs)/_layout.tsx` enforces USER-only access (ADMIN→`/manager`, STAFF→blocked).

### 4. Styling with NativeWind

Use Tailwind classes directly on React Native components:

```tsx
// ✅ CORRECT: NativeWind classes work on View, Text, Pressable, etc.
<View className="flex-1 bg-white px-6 dark:bg-gray-900">
  <Text className="text-3xl font-bold text-[#000000] dark:text-white">Login</Text>
  <Button className="rounded-3xl bg-[#FF6D00] active:bg-[#FF4D00]">
    <Text className="font-bold text-white">Submit</Text>
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

**Auto-registration**: `hooks/usePushNotifications.ts` registers tokens when user logs in (called in `app/_layout.tsx`).  
**Backend Requirement**: Backend must use Expo Push API (not Firebase SDK directly)—see `BACKEND_PUSH_NOTIFICATION_ANALYSIS.md`.

```typescript
// ✅ AUTOMATIC: Hook handles token registration via app/_layout.tsx
const { expoPushToken, isRegistered } = usePushNotifications();
// Token auto-sends to /api/notification/device on user login

// ✅ LOCAL TESTING: Schedule test notifications
import { scheduleLocalNotification } from "@/services/pushNotificationService";
await scheduleLocalNotification({ title: "Test", body: "Works!" }, 5);
```

**Testing**: Use Android emulator or physical iOS device. Expo Push Tool: `https://expo.dev/notifications`

## Key Files to Reference

- **API Setup**: `libs/api.ts` (shows middleware pattern for JWT injection)
- **Auth Flow**: `contexts/AuthContext.tsx` (login/register/logout implementation)
- **Role Enforcement**: `app/(tabs)/_layout.tsx` (mobile-only USER access)
- **Service Pattern**: `services/dishService.ts` (canonical CRUD hook structure)
- **Type Safety**: `schema-from-be.d.ts` (auto-generated, never edit manually)
- **Push Notifications**: `hooks/usePushNotifications.ts` (auto-registration on login)
- **Provider Setup**: `app/_layout.tsx` (shows provider nesting order)

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
  const roleStr =
    typeof roles[0] === "string" ? roles[0] : roles[0]?.authority || roles[0]?.role || "USER";

  // Remove ROLE_ prefix if present
  const cleanRole = roleStr.replace("ROLE_", "");
  return (cleanRole.toUpperCase() as ROLE_TYPE) || ROLES.USER;
};
```

## Don'ts

❌ **Never** bypass role checks in `app/(tabs)/_layout.tsx`  
❌ **Never** edit `schema-from-be.d.ts` manually (auto-generated)  
❌ **Never** use `fetch()` directly except in `AuthContext.tsx` (login/register don't use JWT middleware)
❌ **Never** use `useMutationHandler` hook (file exists but is empty - use direct mutation patterns)
❌ **Never** store sensitive data in AsyncStorage without encryption  
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
   };
   ```

4. **Dark mode CSS variables**: NativeWind uses HSL format in `global.css`:
   ```css
   --primary: 24 100% 52%; /* NOT hex colors */
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

- **Nov 2024**: Refactored Google OAuth into modular service (`googleAuthService.ts`) with 10+ helper functions
- **Oct 2024**: Switched from mock auth to real JWT backend integration
- **Oct 2024**: Enforced mobile-only USER access (ADMIN redirects to `/manager`, STAFF blocked completely)
- **Oct 2024**: Added push notification infrastructure (frontend complete, backend needs Expo Push adapter)
- **Oct 2024**: Converted all UI text from Vietnamese to English
- **Oct 2024**: Standardized color scheme to orange-primary design system

## Questions to Ask Before Implementing

1. **Does the backend endpoint exist?** → Check `schema-from-be.d.ts` or run `npm run generate-schema`
2. **Does this need persistence?** → Use Zustand persist if client state, React Query for server state
3. **Does this need auth?** → Check if endpoint requires JWT (most do except login/register)
4. **Is this a new screen?** → Add to `app/` directory (file-based routing)
5. **Does this need push notifications?** → Check if backend supports Expo Push API first
