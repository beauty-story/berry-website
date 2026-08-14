"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { createOrder,verifyPayment, } from "@/app/checkout/actions";
import { useCart } from "@/components/cart/CartContext";
import { useRouter } from "next/navigation";


function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript =
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(true)
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false)
      );

      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () =>
      resolve(true);

    script.onerror = () =>
      resolve(false);

    document.body.appendChild(script);
  });
}

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  handler: (response: RazorpayResponse) => void;

  modal?: {
    ondismiss?: () => void;
  };

  theme?: {
    color?: string;
  };
};

type RazorpayInstance = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
}

export default function CheckoutPage() {

  const router = useRouter();
  const { cartItems,clearCart } = useCart();

  const [isCreatingOrder, setIsCreatingOrder] =
    useState(false);

  const [checkoutError, setCheckoutError] =
    useState("");

  const [createdOrderId, setCreatedOrderId] =
    useState<number | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    fullName: "",
    address: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove error for this field while user edits
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/\S+@\S+\.\S+/.test(formData.email)
    ) {
      newErrors.email =
        "Enter a valid email address.";
    }

    if (
      !/^[6-9]\d{9}$/.test(formData.phone)
    ) {
      newErrors.phone =
        "Enter a valid 10-digit Indian phone number.";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required.";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Address is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city =
        "City is required.";
    }

    if (!formData.state) {
      newErrors.state =
        "Select a state.";
    }

    if (
      !/^\d{6}$/.test(formData.pincode)
    ) {
      newErrors.pincode =
        "PIN code must contain 6 digits.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleContinueToPayment =
    async () => {
      const isValid = validateForm();

      if (!isValid) {
        return;
      }

      if (cartItems.length === 0) {
        setCheckoutError(
          "Your cart is empty."
        );
        return;
      }

      setCheckoutError("");
      setCreatedOrderId(null);
      setIsCreatingOrder(true);

      try {
        const result = await createOrder({
          email: formData.email,
          phone: formData.phone,
          fullName: formData.fullName,
          address: formData.address,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,

          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        });

if (!result.success) {
  setCheckoutError(result.error);
  return;
}

setCreatedOrderId(result.orderId);

const scriptLoaded =
  await loadRazorpayScript();

if (!scriptLoaded) {
  setCheckoutError(
    "Unable to load Razorpay. Please check your internet connection."
  );

  return;
}

const razorpayKey =
  process.env
    .NEXT_PUBLIC_RAZORPAY_KEY_ID;

if (!razorpayKey) {
  setCheckoutError(
    "Razorpay key is not configured."
  );

  return;
}

if (!window.Razorpay) {
  setCheckoutError(
    "Razorpay Checkout is unavailable."
  );

  return;
}

const options: RazorpayOptions = {
  key: razorpayKey,

  amount: result.amountPaise,

  currency: "INR",

  name: "Berry Organics",

  description:
    `Payment for Order #${result.orderId}`,

  order_id:
    result.razorpayOrderId,

  prefill: {
    name:
      formData.fullName,

    email:
      formData.email,

    contact:
      formData.phone,
  },


handler: async (
  response: RazorpayResponse
) => {
  console.log(
    "Payment received. Verifying..."
  );

  const verification =
    await verifyPayment({
      localOrderId:
        result.orderId,

      razorpayPaymentId:
        response.razorpay_payment_id,

      razorpayOrderId:
        response.razorpay_order_id,

      razorpaySignature:
        response.razorpay_signature,
    });

if (!verification.success) {
  setCheckoutError(
    verification.error
  );

  return;
}

/*
 * Payment is now:
 *
 * ✓ signature verified
 * ✓ stock reduced
 * ✓ order marked paid
 */

clearCart();

router.push(
  `/order-success?orderId=${result.orderId}`
);

},
  modal: {
    ondismiss: () => {
      console.log(
        "Razorpay payment window closed."
      );
    },
  },
};

const razorpay =
  new window.Razorpay(options);

razorpay.open();




      } catch (error) {
        console.error(
          "Checkout error:",
          error
        );

        setCheckoutError(
          "Something went wrong while creating your order."
        );
      } finally {
        setIsCreatingOrder(false);
      }
    };

  /*
   * EMPTY CART
   */
  if (cartItems.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            Your cart is empty
          </h1>

          <p className="mt-4 text-gray-500">
            Add some products before
            proceeding to checkout.
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
        Checkout
      </h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2">
          {/* Checkout options */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Checkout options
            </h2>

            <p className="mt-3 text-sm text-gray-600">
              Already have an account?
            </p>

            <Link
              href="/sign-in"
              className="mt-4 inline-block border border-gray-900 px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-900 hover:text-white"
            >
              Sign In
            </Link>

            <p className="mt-4 text-sm text-gray-500">
              Or continue below as a
              guest.
            </p>
          </section>

          {/* Contact information */}
          <section className="border-b border-gray-200 py-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Contact Information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="py-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Shipping Address
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={
                    formData.fullName
                  }
                  onChange={handleChange}
                  className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-gray-700"
                >
                  House / Flat /
                  Building
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  value={
                    formData.address
                  }
                  onChange={handleChange}
                  className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.address}
                  </p>
                )}
              </div>

              {/* Area */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="area"
                  className="text-sm font-medium text-gray-700"
                >
                  Street / Area
                </label>

                <input
                  id="area"
                  name="area"
                  type="text"
                  value={formData.area}
                  onChange={handleChange}
                  className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="text-sm font-medium text-gray-700"
                >
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.city}
                  </p>
                )}
              </div>

              {/* State */}
              <div>
                <label
                  htmlFor="state"
                  className="text-sm font-medium text-gray-700"
                >
                  State
                </label>

                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-2 w-full border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900"
                >
                  <option value="">
                    Select state
                  </option>

                  <option value="Kerala">
                    Kerala
                  </option>

                  <option value="Karnataka">
                    Karnataka
                  </option>

                  <option value="Tamil Nadu">
                    Tamil Nadu
                  </option>

                  <option value="Maharashtra">
                    Maharashtra
                  </option>

                  <option value="Delhi">
                    Delhi
                  </option>
                </select>

                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.state}
                  </p>
                )}
              </div>

              {/* PIN Code */}
              <div>
                <label
                  htmlFor="pincode"
                  className="text-sm font-medium text-gray-700"
                >
                  PIN Code
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={
                    formData.pincode
                  }
                  onChange={handleChange}
                  className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

                {errors.pincode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.pincode}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="text-sm font-medium text-gray-700"
                >
                  Country
                </label>

                <input
                  id="country"
                  type="text"
                  value="India"
                  disabled
                  className="mt-2 w-full border border-gray-300 bg-gray-100 px-4 py-3 text-gray-500"
                />
              </div>
            </div>

            {/* Server checkout error */}
            {checkoutError && (
              <div className="mt-6 border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  {checkoutError}
                </p>
              </div>
            )}

            {/* Temporary success message */}
            {createdOrderId && (
              <div className="mt-6 border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                  Pending order #
                  {createdOrderId}{" "}
                  created successfully.
                </p>

                <p className="mt-1 text-xs text-green-700">
                  Payment integration
                  will be added next.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={
                handleContinueToPayment
              }
              disabled={
                isCreatingOrder
              }
              className="mt-8 w-full bg-gray-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingOrder
                ? "Creating Order..."
                : "Continue to Payment"}
            </button>
          </section>
        </div>

        {/* RIGHT SIDE - Order summary */}
        <aside className="h-fit bg-[#faf9f7] p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Order Summary
          </h2>

          <div className="mt-6 space-y-5">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {item.size}
                      {item.size
                        ? " × "
                        : "Qty: "}
                      {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-gray-900">
                    ₹
                    {(
                      item.price *
                      item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            {/* Subtotal */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-medium">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            {/* Shipping */}
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-gray-600">
                Shipping
              </span>

              <span className="text-gray-500">
                Calculated later
              </span>
            </div>

            {/* Total */}
            <div className="mt-6 flex justify-between border-t border-gray-200 pt-6">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-lg font-semibold">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}