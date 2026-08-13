"use client";

import {
  deleteProduct,
  setProductActive,
} from "@/app/admin/products/actions";

type ProductActionsProps = {
  productId: number;
  active: boolean;
};

export default function ProductActions({
  productId,
  active,
}: ProductActionsProps) {
  const toggleProductStatus = setProductActive.bind(
    null,
    productId,
    !active
  );

  const removeProduct = deleteProduct.bind(
    null,
    productId
  );

  return (
    <div className="flex items-center gap-3">

      {/* Activate / Deactivate */}
      <form action={toggleProductStatus}>
        <button
          type="submit"
          className="text-sm font-medium text-gray-600 underline hover:text-gray-900"
        >
          {active ? "Deactivate" : "Activate"}
        </button>
      </form>

      {/* Delete */}
      <form
        action={removeProduct}
        onSubmit={(e) => {
          const confirmed = window.confirm(
            "Are you sure you want to permanently delete this product?"
          );

          if (!confirmed) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          className="text-sm font-medium text-red-600 underline hover:text-red-800"
        >
          Delete
        </button>
      </form>

    </div>
  );
}