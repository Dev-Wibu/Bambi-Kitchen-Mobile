import type { components } from "@/schema-from-be";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getPersistStorage } from "./persistStorage";

export interface CartItem {
  id: string; // local uuid
  dishId: number;
  name: string;
  price: number; // cents
  quantity: number;
  imageUrl?: string | null;
  // Optional for size/template flow
  dishTemplate?: components["schemas"]["DishTemplate"];
  // Optional for add/remove ingredients flow
  recipe?: components["schemas"]["RecipeItemDTO"][];
  // Optional original dish reference when customizing
  basedOnId?: number;
  // Optional per-item note
  note?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  updateItem: (id: string, patch: Partial<CartItem>) => void;
  clear: () => void;
  getTotal: () => number;
}

const CART_STORAGE_KEY = "cart-storage";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        // Merge only for real dishes with a valid ID and identical configuration
        const canMerge = item.dishId && item.dishId > 0 && !item.recipe && !item.dishTemplate;
        if (canMerge) {
          const existing = get().items.find(
            (i) => i.dishId === item.dishId && !i.recipe && !i.dishTemplate
          );
          if (existing) {
            set({
              items: get().items.map((i) =>
                i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            });
            return;
          }
        }

        const uniqueKey = `${item.dishId || "custom"}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        set({ items: [...get().items, { ...item, id: uniqueKey }] });
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, qty) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)) }),
      updateItem: (id, patch) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
      clear: () => set({ items: [] }),
      getTotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(getPersistStorage),
    }
  )
);
