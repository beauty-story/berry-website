import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/auth/isAdmin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      stock,
      active
    `)
    .order("id", { ascending: true });

  if (error) {
    console.error("Admin products error:", error.message);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-gray-900">
            Products
          </h1>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-gray-900 px-5 py-3 text-sm font-medium text-white"
        >
          Add Product
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full border-collapse text-left">

          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-4 pr-6 text-sm font-medium">
                Product
              </th>

              <th className="py-4 pr-6 text-sm font-medium">
                Price
              </th>

              <th className="py-4 pr-6 text-sm font-medium">
                Stock
              </th>

              <th className="py-4 pr-6 text-sm font-medium">
                Status
              </th>

              <th className="py-4 text-sm font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {products?.map((product) => (
              <tr
                key={product.id}
                className="border-b border-gray-200"
              >
                <td className="py-5 pr-6">
                  <p className="font-medium text-gray-900">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {product.slug}
                  </p>
                </td>

                <td className="py-5 pr-6">
                  ₹{Number(product.price)}
                </td>

                <td className="py-5 pr-6">
                  {product.stock}
                </td>

                <td className="py-5 pr-6">
                  {product.active ? (
                    <span className="text-sm text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="py-5">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-sm font-medium underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {products?.length === 0 && (
        <p className="mt-10 text-gray-500">
          No products found.
        </p>
      )}

    </main>
  );
}