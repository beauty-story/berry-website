import { notFound, redirect } from "next/navigation";

import { isAdmin } from "@/lib/auth/isAdmin";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "@/app/admin/products/actions";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      short_description,
      description,
      price,
      image_url,
      size,
      stock,
      benefits,
      ingredients,
      how_to_use,
      active
    `)
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    console.error("Edit product error:", error.message);
    notFound();
  }

  if (!product) {
    notFound();
  }

  const updateProductWithId = updateProduct.bind(
    null,
    product.id
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Admin
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Edit Product
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Update {product.name}
        </p>
      </div>

      <form
        action={updateProductWithId}
        className="mt-10 space-y-8"
      >
        {/* Basic Information */}
        <section className="border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">
            Basic Information
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Product Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={product.name}
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="shortDescription"
                className="text-sm font-medium"
              >
                Short Description
              </label>

              <textarea
                id="shortDescription"
                name="shortDescription"
                rows={3}
                defaultValue={
                  product.short_description ?? ""
                }
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Full Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={product.description ?? ""}
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>
          </div>
        </section>

        {/* Price & Inventory */}
        <section className="border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">
            Pricing & Inventory
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="price"
                className="text-sm font-medium"
              >
                Price
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={Number(product.price)}
                className="mt-2 w-full border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="stock"
                className="text-sm font-medium"
              >
                Stock
              </label>

              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={product.stock}
                className="mt-2 w-full border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="size"
                className="text-sm font-medium"
              >
                Size
              </label>

              <input
                id="size"
                name="size"
                type="text"
                defaultValue={product.size ?? ""}
                className="mt-2 w-full border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="text-sm font-medium"
              >
                Image URL
              </label>

              <input
                id="imageUrl"
                name="imageUrl"
                type="text"
                defaultValue={product.image_url ?? ""}
                className="mt-2 w-full border border-gray-300 px-4 py-3"
              />
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">
            Product Details
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="benefits"
                className="text-sm font-medium"
              >
                Benefits
              </label>

              <textarea
                id="benefits"
                name="benefits"
                rows={5}
                defaultValue={
                  product.benefits?.join("\n") ?? ""
                }
                className="mt-2 w-full border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="ingredients"
                className="text-sm font-medium"
              >
                Ingredients
              </label>

              <textarea
                id="ingredients"
                name="ingredients"
                rows={5}
                defaultValue={
                  product.ingredients?.join("\n") ?? ""
                }
                className="mt-2 w-full border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="howToUse"
                className="text-sm font-medium"
              >
                How to Use
              </label>

              <textarea
                id="howToUse"
                name="howToUse"
                rows={5}
                defaultValue={
                  product.how_to_use?.join("\n") ?? ""
                }
                className="mt-2 w-full border border-gray-300 px-4 py-3"
              />
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="border border-gray-200 p-6">
          <label className="flex items-center gap-3">
            <input
              name="active"
              type="checkbox"
              defaultChecked={product.active}
              className="h-4 w-4"
            />

            <span className="text-sm font-medium">
              Product is active
            </span>
          </label>
        </section>

        <button
          type="submit"
          className="w-full bg-gray-900 px-6 py-4 text-sm font-medium text-white hover:bg-gray-700"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}