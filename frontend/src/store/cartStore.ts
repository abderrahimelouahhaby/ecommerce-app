import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Product } from "../types/product";
import type { CartItem } from "../types/cart";

type CartStore = {
  items: CartItem[];

  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + 1,
                    }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: 1,
              },
            ],
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.productId !== productId
          ),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      totalItems: () => {
        return get().items.reduce(
          (total, item) => total + item.quantity,
          0
        );
      },

      totalPrice: () => {
        return get().items.reduce(
          (total, item) =>
            total + Number(item.price) * item.quantity,
          0
        );
      },
    }),
    {
      name: "myshop-cart",
    }
  )
);