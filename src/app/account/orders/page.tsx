import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AccountOrdersPage() {
  const supabase = await createClient();

  /* --------------------------------
     1. Get signed-in customer
  --------------------------------- */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  /* --------------------------------
     2. Load customer's orders
  --------------------------------- */

  const {
    data: orders,
    error,
  } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      payment_status,
      order_status,
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
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Customer orders error:",
      error.message
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          My Account
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          My Orders
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          View your previous purchases and delivery status.
        </p>

        <Link
          href="/account"
          className="mt-4 inline-block text-sm font-medium text-gray-700 underline"
        >
          Back to Account
        </Link>
      </div>

      {/* No orders */}
      {!orders || orders.length === 0 ? (
        <div className="mt-10 border border-gray-200 p-10 text-center">

          <h2 className="text-lg font-medium text-gray-900">
            No orders yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your completed orders will appear here.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700"
          >
            Start Shopping
          </Link>

        </div>
      ) : (

        <div className="mt-10 space-y-6">

          {orders.map((order) => (

            

            <article
              key={order.id}
              className="border border-gray-200"
            >

              {/* Order header */}
              <div className="flex flex-col gap-4 border-b border-gray-200 bg-[#faf9f7] p-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="font-semibold text-gray-900">
                    Order #{order.id}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(
                      order.created_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>

                <p className="text-lg font-semibold text-gray-900">
                  ₹
                  {Number(
                    order.total_amount
                  ).toFixed(2)}
                </p>


              </div>

              <div className="p-5">

                {/* Status */}
                <div className="flex flex-wrap gap-3">

                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium capitalize ${
                      order.payment_status === "paid"
                        ? "bg-green-100 text-green-700"
                        : order.payment_status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    Payment:{" "}
                    {order.payment_status}
                  </span>

                  <span className="inline-flex bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                    Order:{" "}
                    {order.order_status}
                  </span>

                </div>

                {/* Products */}
                <div className="mt-6 divide-y divide-gray-100">

                  {order.order_items?.map(
                    (item) => (

                      <div
                        key={item.id}
                        className="flex justify-between gap-6 py-4"
                      >

                        <div>

                          <p className="font-medium text-gray-900">
                            {item.product_name}
                          </p>

                          {item.product_size && (
                            <p className="mt-1 text-sm text-gray-500">
                              {item.product_size}
                            </p>
                          )}

                          <p className="mt-1 text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>

                        </div>

                        <p className="text-sm font-medium text-gray-900">
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

                {/* Tracking */}
                {order.tracking_number && (

                  <div className="mt-6 border-t border-gray-200 pt-5">

                    <p className="text-sm font-medium text-gray-900">
                      Shipping
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      {order.shipping_provider ??
                        "India Post"}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Tracking number:{" "}
                      <span className="font-medium text-gray-900">
                        {order.tracking_number}
                      </span>
                    </p>

                  </div>

                )}
                <div className="border-t mt-6 border-gray-300 ">
                    <Link href={`/account/orders/${order.id}`}
                        className="mt-6 inline-block text-sm font-medium text-gray-900 underline">
                        View Order
                    </Link>
                </div>

              </div>

            </article>

          ))}

        </div>

      )}

    </main>
  );
}