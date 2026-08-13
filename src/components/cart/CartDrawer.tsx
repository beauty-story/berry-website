"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({
  isOpen,
  onClose,
}: CartDrawerProps) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "visible" : "invisible"
      }`}
    >
      {/* Overlay */}
      <button
        onClick={onClose}
        aria-label="Close cart"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Cart
          </h2>

          <button
            onClick={onClose}
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-gray-500">
                Your cart is empty.
              </p>

              <button
                onClick={onClose}
                className="mt-6 bg-gray-900 px-5 py-3 text-sm font-medium text-white"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-gray-200 pb-6"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={onClose}
                      className="font-medium text-gray-900"
                    >
                      {item.name}
                    </Link>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.size}
                    </p>

                    <p className="mt-2 text-sm font-medium text-gray-900">
                      ₹{item.price}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity === 1}
                        className="h-8 w-8 border border-gray-300 disabled:opacity-40"
                      >
                        -
                      </button>

                      <span className="min-w-6 text-center text-sm">
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
                        className="h-8 w-8 border border-gray-300 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                      className="mt-3 w-fit text-xs text-gray-500 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-6">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-semibold text-gray-900">
                ₹{subtotal}
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Shipping calculated at checkout.
            </p>

            <Link
              href="/cart"
              onClick={onClose}
              className="mt-5 block w-full border border-gray-900 px-4 py-3 text-center text-sm font-medium text-gray-900"
            >
              View Cart
            </Link>

            <Link
              href="/checkout"
              onClick={onClose}
              className="mt-3 block w-full bg-gray-900 px-4 py-3 text-center text-sm font-medium text-white"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}