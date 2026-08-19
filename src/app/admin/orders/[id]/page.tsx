import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { isAdmin } from "@/lib/auth/isAdmin";
import { createClient } from "@/lib/supabase/server";
import {
  updateOrderStatus,
  updateTracking,
} from "@/app/admin/orders/actions";



type AdminOrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminOrderDetailsPage({
  params,
}: AdminOrderDetailsPageProps) {
  /* -----------------------------
     1. Protect admin route
  ------------------------------ */

  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  /* -----------------------------
     2. Get order ID from URL
  ------------------------------ */

  const { id } = await params;

  const orderId = Number(id);

  if (!Number.isInteger(orderId)) {
    notFound();
  }

  /* -----------------------------
     3. Load order + order items
  ------------------------------ */

  const supabase =
    await createClient();

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
      payment_order_id,
      payment_id,

      shipping_provider,
      tracking_number,

      created_at,
      updated_at,

      order_items (
        id,
        product_id,
        product_name,
        product_size,
        unit_price,
        quantity
      )
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error(
      "Admin order details error:",
      error.message
    );

    notFound();
  }

  if (!order) {
    notFound();
  }

  const updateStatusWithId =
  updateOrderStatus.bind(
    null,
    order.id
  );

const updateTrackingWithId =
  updateTracking.bind(
    null,
    order.id
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Admin Order
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
          href="/admin/orders"
          className="text-sm font-medium text-gray-700 underline"
        >
          Back to Orders
        </Link>

      </div>

      {/* Status */}
      <section className="mt-10 grid gap-5 sm:grid-cols-2">

        {/* Payment status */}
        <div className="border border-gray-200 p-6">

          <p className="text-sm text-gray-500">
            Payment Status
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

        <form
            action={updateStatusWithId}
            className="mt-4 flex gap-3"
        >
            <select
            name="orderStatus"
            defaultValue={order.order_status}
            className="flex-1 border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
            >
            <option value="new">
                New
            </option>

            <option value="processing">
                Processing
            </option>

            <option value="packed">
                Packed
            </option>

            <option value="shipped">
                Shipped
            </option>

            <option value="delivered">
                Delivered
            </option>

            <option value="cancelled">
                Cancelled
            </option>
            </select>

            <button
            type="submit"
            className="bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
            Update
            </button>
        </form>
        </div>

      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">

        {/* LEFT SIDE */}
        <div className="space-y-8 lg:col-span-2">

          {/* Products */}
          <section className="border border-gray-200 p-6">

            <h2 className="text-xl font-semibold text-gray-900">
              Order Items
            </h2>

            {!order.order_items ||
            order.order_items.length === 0 ? (
              <p className="mt-6 text-sm text-gray-500">
                No order items found.
              </p>
            ) : (
              <div className="mt-6 divide-y divide-gray-200">

                {order.order_items.map(
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
            )}

          </section>

          {/* Customer */}
          <section className="border border-gray-200 p-6">

            <h2 className="text-xl font-semibold text-gray-900">
              Customer
            </h2>

            <div className="mt-6 space-y-3 text-sm">

              <div>
                <p className="text-gray-500">
                  Name
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {order.customer_name}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Email
                </p>

                <p className="mt-1 text-gray-900">
                  {order.email}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Phone
                </p>

                <p className="mt-1 text-gray-900">
                  {order.phone}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Checkout Type
                </p>

                <p className="mt-1 text-gray-900">
                  {order.user_id
                    ? "Registered customer"
                    : "Guest checkout"}
                </p>
              </div>

            </div>

          </section>

          {/* Shipping address */}
          <section className="border border-gray-200 p-6">

            <h2 className="text-xl font-semibold text-gray-900">
              Shipping Address
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
                PIN: {order.pincode}
              </p>

              <p>
                {order.country}
              </p>

            </div>

          </section>

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-8">

          {/* Price summary */}
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

          {/* Payment information */}
          <section className="border border-gray-200 p-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Payment
            </h2>

            <div className="mt-6 space-y-4 text-sm">

              <div>
                <p className="text-gray-500">
                  Provider
                </p>

                <p className="mt-1 capitalize text-gray-900">
                  {order.payment_provider ??
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Razorpay Order ID
                </p>

                <p className="mt-1 break-all text-gray-900">
                  {order.payment_order_id ??
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Payment ID
                </p>

                <p className="mt-1 break-all text-gray-900">
                  {order.payment_id ??
                    "—"}
                </p>
              </div>

            </div>

          </section>

          {/* Shipping information */}
            <section className="border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
                Shipping
            </h2>

            <form
                action={updateTrackingWithId}
                className="mt-6 space-y-4"
            >
                <div>
                <label
                    htmlFor="shippingProvider"
                    className="text-sm text-gray-500"
                >
                    Shipping Provider
                </label>

                <input
                    id="shippingProvider"
                    name="shippingProvider"
                    type="text"
                    defaultValue={
                    order.shipping_provider ??
                    "India Post"
                    }
                    className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
                </div>

                <div>
                <label
                    htmlFor="trackingNumber"
                    className="text-sm text-gray-500"
                >
                    Tracking Number
                </label>

                <input
                    id="trackingNumber"
                    name="trackingNumber"
                    type="text"
                    defaultValue={
                    order.tracking_number ?? ""
                    }
                    placeholder="Enter tracking number"
                    className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
                </div>

                <button
                type="submit"
                className="w-full bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-700"
                >
                Save Shipping Info
                </button>
            </form>
            </section>

        </div>

      </div>

    </main>
  );
}