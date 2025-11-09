import { create } from "zustand";

// Single customize store that supports both small selection persistence and
// the older setForDish/getForDish API used in the detail screen.

type SelectionMap = Record<number, number>; // ingredientId -> units (1 unit = 100g)

type CustomizeValue = {
  selectedById?: SelectionMap;
  selectedCategoryId?: number | null;
  showCustomize?: boolean;
};

type StoreState = {
  // easy access pattern
  selections: Record<number, SelectionMap>;
  setSelection: (dishId: number, sel: SelectionMap) => void;
  getSelection: (dishId: number) => SelectionMap | undefined;
  clearSelection: (dishId: number) => void;

  // legacy-style cache used elsewhere
  cache: Record<number, CustomizeValue>;
  setForDish: (dishId: number, value: CustomizeValue) => void;
  getForDish: (dishId: number) => CustomizeValue | undefined;
};

export const useCustomizeStore = create<StoreState>((set, get) => ({
  selections: {},
  setSelection: (dishId, sel) => set((s) => ({ selections: { ...s.selections, [dishId]: sel } })),
  getSelection: (dishId) => get().selections[dishId],
  clearSelection: (dishId) =>
    set((s) => {
      const next = { ...s.selections };
      delete next[dishId];
      return { selections: next };
    }),

  cache: {},
  setForDish: (dishId, value) => set((s) => ({ cache: { ...s.cache, [dishId]: value } })),
  getForDish: (dishId) => get().cache[dishId],
}));

export default useCustomizeStore;
