# Mock Data Documentation

## Overview

This application uses centralized mock data to enable UI/UX development when backend data is unavailable. All mock data is consolidated in a single file for easy management and removal.

## Mock Data Location

**File:** `/data/mockData.ts`

This file contains:

- Mock dishes (8 items)
- Mock dish categories (5 categories)
- Mock dish templates (3 size templates: S, M, L)
- Mock discounts (3 promotional offers)
- Mock ingredients (10 ingredients)
- Mock ingredient categories (5 categories)
- Mock orders (3 order history items)
- Mock accounts (2 user accounts)
- Mock notifications (3 notifications)

## How Mock Data Works

Mock data is automatically used when:

1. The `USE_MOCK_DATA` flag is set to `true` in `/data/mockData.ts`
2. The backend API returns empty or no data

Pages that use mock data:

- **Home Page** (`app/(tabs)/home/index.tsx`): Shows featured dishes, promotions, categories, and meal plans
- **Menu Page** (`app/(tabs)/menu/index.tsx`): Displays dish templates and dishes with search functionality
- **Order Page** (`app/(tabs)/order/index.tsx`): Shows order history with status and ratings
- **Profile Page** (`app/(tabs)/profile/index.tsx`): Displays account information

## How to Remove Mock Data

When you have real backend data and want to remove all mock data:

### Step 1: Delete the Mock Data File

```bash
rm data/mockData.ts
```

### Step 2: Remove Mock Data Imports

Remove these lines from the following files:

#### In `app/(tabs)/home/index.tsx`:

```typescript
// Remove these imports
import {
  USE_MOCK_DATA,
  mockDishTemplates,
  mockDishCategories,
  mockDiscounts,
  mockDishes,
} from "@/data/mockData";

// Remove the mock data logic (lines with USE_MOCK_DATA checks)
// Keep only the API calls
```

#### In `app/(tabs)/menu/index.tsx`:

```typescript
// Remove these imports
import { USE_MOCK_DATA, mockDishCategories, mockDishTemplates, mockDishes } from "@/data/mockData";

// Remove the mock data logic
```

#### In `app/(tabs)/order/index.tsx`:

```typescript
// Remove these imports
import { USE_MOCK_DATA, mockOrders } from "@/data/mockData";

// Remove the mock data logic
```

#### In `app/(tabs)/profile/index.tsx`:

```typescript
// Remove these imports
import { USE_MOCK_DATA, mockAccounts } from "@/data/mockData";

// Remove the mock data logic
```

### Step 3: Simplify Data Assignments

After removing mock data, your data assignments should look like:

```typescript
// Example for home page
const { data: dishTemplates, isLoading: loadingTemplates } = useDishTemplates();
const { data: categories, isLoading: loadingCategories } = useDishCategories();
const { data: discounts, isLoading: loadingDiscounts } = useDiscounts();

// Use directly without mock fallback
```

### Step 4: Test the Application

Run the application to ensure:

1. No TypeScript errors
2. All pages display data correctly from the backend
3. Empty states are shown when there's no data
4. No import errors for the deleted mock data file

## Quick Toggle

If you want to temporarily disable mock data without deleting the file:

1. Open `/data/mockData.ts`
2. Change `export const USE_MOCK_DATA = true;` to `export const USE_MOCK_DATA = false;`

This will make the app use only real backend data.

## Notes

- Mock data uses the same TypeScript types as the real backend API
- All mock data is properly formatted according to the OpenAPI schema
- The mock data is designed to be representative of real data for UI testing
- Placeholder images use `placehold.co` service for dish images
