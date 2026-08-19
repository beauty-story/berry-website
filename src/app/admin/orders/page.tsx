
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/auth/isAdmin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOrdersPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const supabase = await createClient();

  const {
    data: orders,
    error,
  } = await supabase
    .from("orders")
    .select(`
      id,
      customer_name,
      email,
      phone,
      total_amount,
      payment_status,
      order_status,
      payment_provider,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Admin orders error:",
      error.message
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-gray-900">
            Orders
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage customer orders and payments.
          </p>
        </div>

        <Link
          href="/admin"
          className="text-sm font-medium text-gray-600 underline hover:text-gray-900"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* No orders */}
      {!orders || orders.length === 0 ? (
        <div className="mt-10 border border-gray-200 p-10 text-center">
          <p className="text-gray-500">
            No orders found.
          </p>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="px-3 py-4 font-medium">
                  Order
                </th>

                <th className="px-3 py-4 font-medium">
                  Customer
                </th>

                <th className="px-3 py-4 font-medium">
                  Total
                </th>

                <th className="px-3 py-4 font-medium">
                  Payment
                </th>

                <th className="px-3 py-4 font-medium">
                  Status
                </th>

                <th className="px-3 py-4 font-medium">
                  Date
                </th>

                <th className="px-3 py-4 font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100"
                >
                  {/* Order */}
                  <td className="px-3 py-5">
                    <p className="font-medium text-gray-900">
                      #{order.id}
                    </p>
                  </td>

                  {/* Customer */}
                  <td className="px-3 py-5">
                    <p className="font-medium text-gray-900">
                      {order.customer_name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {order.email}
                    </p>

                    <p className="text-xs text-gray-500">
                      {order.phone}
                    </p>
                  </td>

                  {/* Total */}
                  <td className="px-3 py-5">
                    ₹
                    {Number(
                      order.total_amount
                    ).toFixed(2)}
                  </td>

                  {/* Payment */}
                  <td className="px-3 py-5">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium ${
                        order.payment_status ===
                        "paid"
                          ? "bg-green-100 text-green-700"
                          : order.payment_status ===
                              "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>

                  {/* Order Status */}
                  <td className="px-3 py-5">
                    <span className="inline-flex bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                      {order.order_status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-3 py-5 text-sm text-gray-600">
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
                  </td>

                  {/* Action */}
                  <td className="px-3 py-5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-medium text-gray-900 underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}