import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/auth/isAdmin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const supabase = await createClient();

  /*
   * Run independent queries in parallel.
   */
  const [
    totalOrdersResult,
    paidOrdersResult,
    activeProductsResult,
    paidRevenueResult,
  ] = await Promise.all([
    /*
     * Total orders
     */
    supabase
      .from("orders")
      .select("*", {
        count: "exact",
        head: true,
      }),

    /*
     * Paid orders
     */
    supabase
      .from("orders")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("payment_status", "paid"),

    /*
     * Active products
     */
    supabase
      .from("products")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("active", true),

    /*
     * Paid order totals
     */
    supabase
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "paid"),
  ]);

  /*
   * Log database errors if any.
   */
  if (totalOrdersResult.error) {
    console.error(
      "Total orders error:",
      totalOrdersResult.error.message
    );
  }

  if (paidOrdersResult.error) {
    console.error(
      "Paid orders error:",
      paidOrdersResult.error.message
    );
  }

  if (activeProductsResult.error) {
    console.error(
      "Active products error:",
      activeProductsResult.error.message
    );
  }

  if (paidRevenueResult.error) {
    console.error(
      "Revenue error:",
      paidRevenueResult.error.message
    );
  }

  /*
   * Count values
   */
  const totalOrders =
    totalOrdersResult.count ?? 0;

  const paidOrders =
    paidOrdersResult.count ?? 0;

  const activeProducts =
    activeProductsResult.count ?? 0;

  /*
   * Calculate revenue from paid orders only.
   */
  const revenue =
    paidRevenueResult.data?.reduce(
      (total, order) =>
        total +
        Number(order.total_amount),
      0
    ) ?? 0;

  const metrics = [
    {
      label: "Total Orders",
      value: totalOrders.toString(),
    },
    {
      label: "Paid Orders",
      value: paidOrders.toString(),
    },
    {
      label: "Revenue",
      value: `₹${revenue.toFixed(2)}`,
    },
    {
      label: "Active Products",
      value: activeProducts.toString(),
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Berry Organics
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage products, orders and store activity.
        </p>
      </div>

      {/* Metrics */}
      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="border border-gray-200 p-6"
          >
            <p className="text-sm text-gray-500">
              {metric.label}
            </p>

            <p className="mt-3 text-3xl font-semibold text-gray-900">
              {metric.value}
            </p>
          </div>
        ))}

      </section>

      {/* Management */}
      <section className="mt-10 grid gap-6 md:grid-cols-2">

        {/* Products */}
        <Link
          href="/admin/products"
          className="group border border-gray-200 p-8 transition hover:border-gray-900"
        >
          <h2 className="text-xl font-semibold text-gray-900">
            Products
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Add, edit, activate and manage product inventory.
          </p>

          <p className="mt-6 text-sm font-medium text-gray-900 underline">
            Manage Products
          </p>
        </Link>

        {/* Orders */}
        <Link
          href="/admin/orders"
          className="group border border-gray-200 p-8 transition hover:border-gray-900"
        >
          <h2 className="text-xl font-semibold text-gray-900">
            Orders
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            View customer orders, payment status and shipping.
          </p>

          <p className="mt-6 text-sm font-medium text-gray-900 underline">
            Manage Orders
          </p>
        </Link>

      </section>

    </main>
  );
}