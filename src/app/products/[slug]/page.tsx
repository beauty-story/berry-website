import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductPurchase from "@/components/product/ProductPurchase";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

const supabase = await createClient();

const { data: product, error } = await supabase
  .from("products")
  .select(`
    id,
    name,
    slug,
    short_description,
    description,
    price,
    image_url,
    size,
    stock,
    benefits,
    ingredients,
    how_to_use
  `)
  .eq("slug", slug)
  .eq("active",true)
  .maybeSingle();

if (error) {
  console.error("Product error:", error.message);
  notFound();
}

if (!product) {
  notFound();
}



  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-2">

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image_url??"/images/hero-product.jpg"}
            alt={product.name}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-center">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Beauty Collection
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-gray-900 sm:text-4xl">
            {product.name}
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            {product.size}
          </p>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            {product.short_description}
          </p>

          <p className="mt-6 text-2xl font-semibold text-gray-900">
            ₹{product.price}
          </p>

          <p className="mt-3 text-sm text-green-700">
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>
        
          <ProductPurchase
          id={product.id}
          name={product.name}
          slug={product.slug}
          price={product.price}
          image={product.image_url??"images/hero-product.jpg"}
          size={product.size??""}
          stock={product.stock}
        />
          
        </div>
              </div>

        <section className="mt-20 border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-semibold text-gray-900">
                Why you'll love it
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {product.benefits.map((benefit) => (
                <div
                    key={benefit}
                    className="border border-gray-200 p-6"
                >
                    <p className="text-gray-700">{benefit}</p>
                </div>
                ))}
            </div>
        </section>

        <section className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-900">
                Key Ingredients
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {product.ingredients.map((ingredient) => (
                <div
                    key={ingredient}
                    className="bg-[#faf9f7] p-6"
                >
                    <p className="font-medium text-gray-900">
                    {ingredient}
                    </p>
                </div>
                ))}
            </div>  

        </section>

        <section className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-900">
                How to Use
            </h2>

            <div className="mt-8 space-y-5">
                {product.how_to_use.map((step, index) => (
                <div
                    key={step}
                    className="flex gap-4"
                >
                    <span className="font-semibold text-gray-400">
                    {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="text-gray-700">
                    {step}
                    </p>
                </div>
                ))}
            </div>
        </section>

        <section className="mt-16 border-t border-gray-200 py-16">
            <h2 className="text-2xl font-semibold text-gray-900">
                Product Details
            </h2>

            <p className="mt-6 max-w-3xl leading-7 text-gray-600">
                {product.description}
            </p>
        </section>




    </main>
  );
}