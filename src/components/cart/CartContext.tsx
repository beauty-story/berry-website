"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect
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
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;

  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
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
  const [cartLoaded,setCartLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => {
  setIsCartOpen(true);
};

const closeCart = () => {
  setIsCartOpen(false);
};

const clearCart = () => {
  setCartItems([]);
};

  
  useEffect(() => {
  const savedCart = localStorage.getItem("beauty-store-cart");

  if (savedCart) {
    try {
      const parsedCart = JSON.parse(savedCart);

      setCartItems(parsedCart);
    } catch {
      localStorage.removeItem("beauty-store-cart");
    }
  }

      setCartLoaded(true);
    }, []);

    useEffect(() => {
  if (!cartLoaded) {
    return;
  }

  localStorage.setItem(
    "beauty-store-cart",
    JSON.stringify(cartItems)
  );
}, [cartItems, cartLoaded]);

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

      const updateQuantity = (id: number, quantity: number) => {
      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.max(
                  1,
                  Math.min(quantity, item.stock)
                ),
              }
            : item
        )
      );
    };

    const removeFromCart = (id: number) => {
      setCartItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );
    };

  return (
<CartContext.Provider
  value={{
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
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