import ProductCard from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";

export default async function FeaturedProducts() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
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
    .eq("active",true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Products error:", error.message);

    return (
      <section className="py-16 text-center">
        <p className="text-red-600">
          Unable to load products.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Our Collection
          </p>

          <h2 className="mt-2 text-3xl font-semibold text-gray-900 sm:text-4xl">
            Shop Our Products
          </h2>
        </div>

        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              shortDescription={product.short_description ?? ""}
              price={Number(product.price)}
              image={product.image_url ?? "/images/hero-product.jpg"}
              size={product.size ?? ""}
              stock={product.stock}
            />
          ))}
        </div>

      </div>
    </section>
  );
}