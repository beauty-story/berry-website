"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

export type CartItem = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string;
  stock: number;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => void;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: CartItem) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id
      );

      // Product already exists in cart
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + product.quantity,
                  item.stock
                ),
              }
            : item
        );
      }

      // New product
      return [...currentItems, product];
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}