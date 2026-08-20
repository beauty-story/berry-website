import type { Metadata } from "next";

import ProductCard from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Shop | Berry Organics",
  description:
    "Shop Berry Organics skincare and personal care products.",
};

export default async function ShopPage() {
  const supabase = await createClient();

  const {
    data: products,
    error,
  } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      short_description,
      price,
      image_url,
      size,
      stock
    `)
    .eq("active", true)
    .order("id", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Shop products error:",
      error.message
    );
  }

  return (
    <main>
      {/* Header */}
      <section className="border-b border-gray-200 bg-[#faf9f7]">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
            Berry Organics
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Shop
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600">
            Explore our collection of thoughtfully selected
            skincare and personal care products.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {!products || products.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="text-xl font-medium text-gray-900">
              No products available
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Please check back soon.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {products.length}{" "}
                {products.length === 1
                  ? "product"
                  : "products"}
              </p>
            </div>

            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  shortDescription={
                    product.short_description ?? ""
                  }
                  price={Number(product.price)}
                  image={
                    product.image_url ??
                    "/images/hero-product.jpg"
                  }
                  size={product.size ?? ""}
                  stock={product.stock}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}