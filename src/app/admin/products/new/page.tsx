import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/auth/isAdmin";
import { createProduct } from "@/app/admin/products/actions";

export default async function NewProductPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Admin
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Add Product
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Create a new product for the storefront.
        </p>
      </div>

      <form
        action={createProduct}
        className="mt-10 space-y-8"
      >
        {/* Basic Information */}
        <section className="border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Basic Information
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Product Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="shortDescription"
                className="text-sm font-medium text-gray-700"
              >
                Short Description
              </label>

              <textarea
                id="shortDescription"
                name="shortDescription"
                rows={3}
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Full Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>
          </div>
        </section>

        {/* Pricing & Inventory */}
        <section className="border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Pricing & Inventory
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="price"
                className="text-sm font-medium text-gray-700"
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
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="stock"
                className="text-sm font-medium text-gray-700"
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
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="size"
                className="text-sm font-medium text-gray-700"
              >
                Size
              </label>

              <input
                id="size"
                name="size"
                type="text"
                placeholder="30 ml"
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="text-sm font-medium text-gray-700"
              >
                Image URL
              </label>
        <div>
          <label
            htmlFor="image"
            className="text-sm font-medium"
          >
            Product Image
          </label>

          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="mt-2 block w-full border border-gray-300 px-4 py-3 text-sm"
          />

          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG or WebP. Maximum 3 MB.
          </p>
        </div>

 
            </div>
          </div>
        </section>

        {/* Product Details */}
        <section className="border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Product Details
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="benefits"
                className="text-sm font-medium text-gray-700"
              >
                Benefits
              </label>

              <p className="mt-1 text-xs text-gray-500">
                Enter one benefit per line.
              </p>

              <textarea
                id="benefits"
                name="benefits"
                rows={5}
                placeholder={`Hydrates skin
Lightweight texture
Suitable for everyday use`}
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="ingredients"
                className="text-sm font-medium text-gray-700"
              >
                Ingredients
              </label>

              <p className="mt-1 text-xs text-gray-500">
                Enter one ingredient per line.
              </p>

              <textarea
                id="ingredients"
                name="ingredients"
                rows={5}
                placeholder={`Niacinamide
Vitamin E
Hyaluronic Acid`}
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="howToUse"
                className="text-sm font-medium text-gray-700"
              >
                How to Use
              </label>

              <p className="mt-1 text-xs text-gray-500">
                Enter one step per line.
              </p>

              <textarea
                id="howToUse"
                name="howToUse"
                rows={5}
                placeholder={`Cleanse your face.
Apply a small amount.
Massage gently until absorbed.`}
                className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
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
              defaultChecked
              className="h-4 w-4"
            />

            <span className="text-sm font-medium text-gray-700">
              Product is active
            </span>
          </label>

          <p className="mt-2 text-xs text-gray-500">
            Active products are visible on the customer storefront.
          </p>
        </section>

        <button
          type="submit"
          className="w-full bg-gray-900 px-6 py-4 text-sm font-medium text-white hover:bg-gray-700"
        >
          Create Product
        </button>
      </form>
    </main>
  );
}