import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productVariantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  price: number;
  imageUrl: string;
  quantity: number;
  isPreorder: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productVariantId: string) => void;
  updateQuantity: (productVariantId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productVariantId === item.productVariantId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productVariantId === item.productVariantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productVariantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productVariantId !== productVariantId),
        })),
      updateQuantity: (productVariantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productVariantId === productVariantId ? { ...i, quantity } : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "cart-storage" }
  )
);
