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
  updateItemNote: (id: string, note: string) => void;
  clear: () => void;
  getTotal: () => number;
  // Fix existing basedOnId items missing dishTemplate
  fixMissingDishTemplates: (defaultTemplate: any) => void;
}

const CART_STORAGE_KEY = "cart-storage";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        // Merge logic:
        // - If both are preset simple dishes (no recipe, no template), merge by dishId
        // - If both have recipe arrays, merge when recipes are identical and basedOnId matches
        const isPresetMergeable =
          item.dishId && item.dishId > 0 && !item.recipe && !item.dishTemplate;
        if (isPresetMergeable) {
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

        // Merge custom items with identical recipes
        if (item.recipe && item.recipe.length > 0) {
          const recipesEqual = (a: any[], b: any[]) => {
            if (!Array.isArray(a) || !Array.isArray(b)) return false;
            if (a.length !== b.length) return false;
            const sortKey = (r: any) => `${r.ingredientId}:${r.quantity}`;
            const sa = [...a].map(sortKey).sort();
            const sb = [...b].map(sortKey).sort();
            for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return false;
            return true;
          };

          const existing = get().items.find(
            (i) =>
              i.recipe &&
              recipesEqual(i.recipe as any[], item.recipe as any[]) &&
              (i.basedOnId || 0) === (item.basedOnId || 0)
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
      updateItemNote: (id, note) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, note } : i)) }),
      clear: () => set({ items: [] }),
      getTotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      // Fix existing basedOnId items that are missing dishTemplate
      fixMissingDishTemplates: (defaultTemplate) => {
        set({
          items: get().items.map((item) => {
            // If item has basedOnId but no dishTemplate, add the default template
            if (item.basedOnId && !item.dishTemplate && defaultTemplate) {
              return { ...item, dishTemplate: defaultTemplate };
            }
            return item;
          }),
        });
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(getPersistStorage),
    }
  )
);
