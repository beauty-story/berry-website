import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products";

export default function FeaturedProducts() {
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
              {...product}
            />
          ))}
        </div>

      </div>
    </section>
  );
}