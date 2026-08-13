import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/isAdmin";



export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Administration
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Manage products, inventory, and customer orders.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-gray-200 p-6">
          <p className="text-sm text-gray-500">
            Total Orders
          </p>

          <p className="mt-2 text-3xl font-semibold text-gray-900">
            0
          </p>
        </div>

        <div className="border border-gray-200 p-6">
          <p className="text-sm text-gray-500">
            Revenue
          </p>

          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ₹0
          </p>
        </div>

        <div className="border border-gray-200 p-6">
          <p className="text-sm text-gray-500">
            Products
          </p>

          <p className="mt-2 text-3xl font-semibold text-gray-900">
            5
          </p>
        </div>

        <div className="border border-gray-200 p-6">
          <p className="text-sm text-gray-500">
            Low Stock
          </p>

          <p className="mt-2 text-3xl font-semibold text-gray-900">
            0
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Products
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Add, edit, disable, and manage product stock.
          </p>
        </div>

        <div className="border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Orders
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            View orders and update shipping status.
          </p>
        </div>
      </div>
    </main>
  );
}