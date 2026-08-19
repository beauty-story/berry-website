import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const supabase = await createClient();

  /* -----------------------------
     1. Require authentication
  ------------------------------ */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  /* -----------------------------
     2. Get order ID
  ------------------------------ */

  const { id } = await params;

  const orderId = Number(id);

  if (!Number.isInteger(orderId)) {
    notFound();
  }

  /* -----------------------------
     3. Load customer's order
  ------------------------------ */

  const {
    data: order,
    error,
  } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,

      customer_name,
      email,
      phone,

      address_line1,
      address_line2,
      city,
      state,
      pincode,
      country,

      subtotal,
      shipping_amount,
      total_amount,

      payment_status,
      order_status,

      payment_provider,

      shipping_provider,
      tracking_number,

      created_at,

      order_items (
        id,
        product_name,
        product_size,
        unit_price,
        quantity
      )
    `)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "Customer order details error:",
      error.message
    );

    notFound();
  }

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            My Order
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-gray-900">
            Order #{order.id}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {new Date(
              order.created_at
            ).toLocaleString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </p>
        </div>

        <Link
          href="/account/orders"
          className="text-sm font-medium text-gray-700 underline"
        >
          Back to My Orders
        </Link>

      </div>

      {/* Status */}
      <section className="mt-10 grid gap-5 sm:grid-cols-2">

        {/* Payment */}
        <div className="border border-gray-200 p-6">

          <p className="text-sm text-gray-500">
            Payment
          </p>

          <span
            className={`mt-3 inline-flex px-3 py-1 text-sm font-medium capitalize ${
              order.payment_status === "paid"
                ? "bg-green-100 text-green-700"
                : order.payment_status === "failed"
                  ? "bg-red-100 text-red-700"
                  : order.payment_status === "refunded"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.payment_status}
          </span>

        </div>

        {/* Order status */}
        <div className="border border-gray-200 p-6">

          <p className="text-sm text-gray-500">
            Order Status
          </p>

          <span className="mt-3 inline-flex bg-gray-100 px-3 py-1 text-sm font-medium capitalize text-gray-700">
            {order.order_status}
          </span>

        </div>

      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">

        {/* LEFT */}
        <div className="space-y-8 lg:col-span-2">

          {/* Products */}
          <section className="border border-gray-200 p-6">

            <h2 className="text-xl font-semibold text-gray-900">
              Items
            </h2>

            <div className="mt-6 divide-y divide-gray-200">

              {order.order_items?.map(
                (item) => (

                  <div
                    key={item.id}
                    className="flex justify-between gap-6 py-5 first:pt-0 last:pb-0"
                  >

                    <div>

                      <p className="font-medium text-gray-900">
                        {item.product_name}
                      </p>

                      {item.product_size && (
                        <p className="mt-1 text-sm text-gray-500">
                          Size:{" "}
                          {item.product_size}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-gray-500">
                        ₹
                        {Number(
                          item.unit_price
                        ).toFixed(2)}
                        {" × "}
                        {item.quantity}
                      </p>

                    </div>

                    <p className="font-medium text-gray-900">
                      ₹
                      {(
                        Number(
                          item.unit_price
                        ) *
                        item.quantity
                      ).toFixed(2)}
                    </p>

                  </div>

                )
              )}

            </div>

          </section>

          {/* Shipping address */}
          <section className="border border-gray-200 p-6">

            <h2 className="text-xl font-semibold text-gray-900">
              Delivery Address
            </h2>

            <div className="mt-6 text-sm leading-7 text-gray-700">

              <p className="font-medium text-gray-900">
                {order.customer_name}
              </p>

              <p>
                {order.address_line1}
              </p>

              {order.address_line2 && (
                <p>
                  {order.address_line2}
                </p>
              )}

              <p>
                {order.city},{" "}
                {order.state}
              </p>

              <p>
                PIN {order.pincode}
              </p>

              <p>
                {order.country}
              </p>

              <p className="mt-3">
                {order.phone}
              </p>

            </div>

          </section>

        </div>

        {/* RIGHT */}
        <div className="space-y-8">

          {/* Total */}
          <section className="bg-[#faf9f7] p-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 text-sm">

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal
                </span>

                <span>
                  ₹
                  {Number(
                    order.subtotal
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Shipping
                </span>

                <span>
                  ₹
                  {Number(
                    order.shipping_amount
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between border-t border-gray-200 pt-4 text-base font-semibold">
                <span>
                  Total
                </span>

                <span>
                  ₹
                  {Number(
                    order.total_amount
                  ).toFixed(2)}
                </span>
              </div>

            </div>

          </section>

          {/* Shipping tracking */}
          <section className="border border-gray-200 p-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Shipping
            </h2>

            <div className="mt-6 space-y-4 text-sm">

              <div>
                <p className="text-gray-500">
                  Courier
                </p>

                <p className="mt-1 text-gray-900">
                  {order.shipping_provider ??
                    "Not assigned yet"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Tracking Number
                </p>

                <p className="mt-1 break-all font-medium text-gray-900">
                  {order.tracking_number ??
                    "Not available yet"}
                </p>
              </div>

            </div>

          </section>

          {/* Payment */}
          <section className="border border-gray-200 p-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Payment
            </h2>

            <div className="mt-6 space-y-2 text-sm">

              <p className="text-gray-500">
                Payment Method
              </p>

              <p className="capitalize text-gray-900">
                {order.payment_provider ??
                  "Not available"}
              </p>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}