"use client";

import CartDrawer from "@/components/cart/CartDrawer";
import { useCart } from "@/components/cart/CartContext";

export default function GlobalCartDrawer() {
  const { isCartOpen, closeCart } = useCart();

  return (
    <CartDrawer
      isOpen={isCartOpen}
      onClose={closeCart}
    />
  );
}