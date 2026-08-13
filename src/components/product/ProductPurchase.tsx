"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";

type ProductPurchaseProps = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string;
  stock: number;
};

export default function ProductPurchase({
  id,
  name,
  slug,
  price,
  image,
  size,
  stock,
}: ProductPurchaseProps) {
  const [quantity, setQuantity] = useState(1);

  const { addToCart ,openCart} = useCart();

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      slug,
      price,
      image,
      size,
      stock,
      quantity,
    });

    openCart();
  };

  return (
    <div className="mt-8">
      <p className="mb-3 text-sm font-medium text-gray-700">
        Quantity
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={decreaseQuantity}
          disabled={quantity === 1}
          className="h-10 w-10 border border-gray-300 text-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          -
        </button>

        <span className="min-w-8 text-center">
          {quantity}
        </span>

        <button
          onClick={increaseQuantity}
          disabled={quantity >= stock}
          className="h-10 w-10 border border-gray-300 text-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={stock === 0}
        className="mt-6 w-full bg-gray-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Add {quantity} to Cart
      </button>
    </div>
  );
}