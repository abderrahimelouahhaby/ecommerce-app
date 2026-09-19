import type { Product } from "./product";

export type CartItem = {
  productId: string;
  name: string;
  price: string;
  imageUrl: string | null;
  quantity: number;
};

export type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};