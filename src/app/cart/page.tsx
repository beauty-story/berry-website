"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            Your Cart
          </h1>

          <p className="mt-6 text-gray-500">
            Your cart is empty.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-gray-900">
        Your Cart
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        
        {/* Cart Items */}
        <div className="space-y-8 lg:col-span-2">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-5 border-b border-gray-200 pb-8"
            >
              {/* Image */}
              <div className="relative h-28 w-28 shrink-0 overflow-hidden bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-1 flex-col">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-medium text-gray-900 hover:text-gray-600"
                >
                  {item.name}
                </Link>

                <p className="mt-1 text-sm text-gray-500">
                  {item.size}
                </p>

                <p className="mt-2 font-medium text-gray-900">
                  ₹{item.price}
                </p>

                {/* Quantity Controls */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity - 1
                      )
                    }
                    disabled={item.quantity === 1}
                    className="h-9 w-9 border border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    -
                  </button>

                  <span className="min-w-6 text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity + 1
                      )
                    }
                    disabled={item.quantity >= item.stock}
                    className="h-9 w-9 border border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="mt-4 w-fit text-sm text-gray-500 underline hover:text-gray-900"
                >
                  Remove
                </button>
              </div>

              {/* Item Total */}
              <div className="hidden sm:block">
                <p className="font-medium text-gray-900">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="h-fit bg-[#faf9f7] p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Order Summary
          </h2>

          <div className="mt-6 flex justify-between text-sm">
            <span className="text-gray-600">
              Subtotal
            </span>

            <span className="font-medium text-gray-900">
              ₹{subtotal}
            </span>
          </div>

          <div className="mt-4 flex justify-between text-sm">
            <span className="text-gray-600">
              Shipping
            </span>

            <span className="text-gray-500">
              Calculated at checkout
            </span>
          </div>

          <div className="mt-6 border-t border-gray-300 pt-6">
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">
                Total
              </span>

              <span className="text-lg font-semibold text-gray-900">
                ₹{subtotal}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-8 block w-full bg-gray-900 px-6 py-4 text-center text-sm font-medium text-white hover:bg-gray-700"
          >
            Proceed to Checkout
          </Link>
        </div>

      </div>
    </main>
  );
}