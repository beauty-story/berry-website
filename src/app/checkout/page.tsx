"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

export default function CheckoutPage() {
  const { cartItems } = useCart();

  const handleContinueToPayment = () => {
  const isValid = validateForm();

  if (!isValid) {
    return;
  }

  console.log("Checkout data:", formData);
};

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.email.trim()) {
    newErrors.email = "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "Enter a valid email address.";
  }

  if (!/^[6-9]\d{9}$/.test(formData.phone)) {
    newErrors.phone = "Enter a valid 10-digit Indian phone number.";
  }

  if (!formData.fullName.trim()) {
    newErrors.fullName = "Full name is required.";
  }

  if (!formData.address.trim()) {
    newErrors.address = "Address is required.";
  }

  if (!formData.city.trim()) {
    newErrors.city = "City is required.";
  }

  if (!formData.state) {
    newErrors.state = "Select a state.";
  }

  if (!/^\d{6}$/.test(formData.pincode)) {
    newErrors.pincode = "PIN code must contain 6 digits.";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  if (cartItems.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            Your cart is empty
          </h1>

          <p className="mt-4 text-gray-500">
            Add some products before proceeding to checkout.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block bg-gray-900 px-6 py-3 text-sm font-medium text-white"
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

        {/* Checkout Form */}
        <div className="lg:col-span-2">

          {/* Account */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Checkout options
            </h2>

            <p className="mt-3 text-sm text-gray-600">
              Already have an account?
            </p>

            <Link
              href="/sign-in"
              className="mt-4 inline-block border border-gray-900 px-5 py-3 text-sm font-medium text-gray-900"
            >
              Sign In
            </Link>

            <p className="mt-4 text-sm text-gray-500">
              Or continue below as a guest.
            </p>
          </section>

          {/* Contact */}
          <section className="border-b border-gray-200 py-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Contact Information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
            value={formData.fullName}
            onChange={handleChange}
            className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />

            {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">
                {errors.fullName}
            </p>
            )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-gray-700"
                >
                  House / Flat / Building
                </label>



                <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

                {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.address}
                </p>
                )}
              </div>



              <div className="sm:col-span-2">
                <label
                  htmlFor="area"
                  className="text-sm font-medium text-gray-700"
                >
                  Street / Area
                </label>

                <input
                  id="area"
                  type="text"
                  className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  name="area"
                    value={formData.area}
                    onChange={handleChange}
                />
              </div>

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
                  <option value="">Select state</option>
                  <option>Kerala</option>
                  <option>Karnataka</option>
                  <option>Tamil Nadu</option>
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                </select>

                {errors.state && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.state}
                </p>
                )}
              </div>

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
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

                {errors.pincode && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.pincode}
                </p>
                )}
              </div>

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

            <button
            type="button"
            onClick={handleContinueToPayment}
            className="mt-8 w-full bg-gray-900 px-6 py-4 text-sm font-medium text-white hover:bg-gray-700"
            >
            Continue to Payment
            </button>
          </section>
        </div>

        {/* Order Summary */}
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
                      {item.size} × {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-gray-900">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-medium">
                ₹{subtotal}
              </span>
            </div>

            <div className="mt-4 flex justify-between text-sm">
              <span className="text-gray-600">
                Shipping
              </span>

              <span className="text-gray-500">
                Calculated later
              </span>
            </div>

            <div className="mt-6 flex justify-between border-t border-gray-200 pt-6">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-lg font-semibold">
                ₹{subtotal}
              </span>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}