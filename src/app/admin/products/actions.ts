"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/isAdmin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getProductImageStoragePath(
  imageUrl: string | null
) {
  if (!imageUrl) {
    return null;
  }

  const marker =
    "/storage/v1/object/public/product-images/";

  const index =
    imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  const path =
    imageUrl.slice(
      index + marker.length
    );

  return path
    ? decodeURIComponent(path)
    : null;
}



export async function createProduct(
  formData: FormData
) {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  const name = String(
    formData.get("name") || ""
  ).trim();

  const shortDescription = String(
    formData.get("shortDescription") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const price = Number(
    formData.get("price")
  );

  const stock = Number(
    formData.get("stock")
  );

  const size = String(
    formData.get("size") || ""
  ).trim();

  const benefitsText = String(
    formData.get("benefits") || ""
  );

  const ingredientsText = String(
    formData.get("ingredients") || ""
  );

  const howToUseText = String(
    formData.get("howToUse") || ""
  );

  const active =
    formData.get("active") === "on";

  const imageFile =
    formData.get("image");

  /* -----------------------------
     Validation
  ------------------------------ */

  if (!name) {
    throw new Error(
      "Product name is required."
    );
  }

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new Error(
      "Enter a valid product price."
    );
  }

  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    throw new Error(
      "Enter a valid stock quantity."
    );
  }

  if (
    !(imageFile instanceof File) ||
    imageFile.size === 0
  ) {
    throw new Error(
      "Product image is required."
    );
  }

  /* -----------------------------
     Validate image
  ------------------------------ */

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    !allowedTypes.includes(
      imageFile.type
    )
  ) {
    throw new Error(
      "Only JPG, PNG and WebP images are allowed."
    );
  }

  const maxFileSize =
    5 * 1024 * 1024;

  if (
    imageFile.size > maxFileSize
  ) {
    throw new Error(
      "Image must be smaller than 5 MB."
    );
  }

  /* -----------------------------
     Generate slug
  ------------------------------ */

  const slug = name
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );

  /* -----------------------------
     Text arrays
  ------------------------------ */

  const benefits =
    benefitsText
      .split("\n")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);

  const ingredients =
    ingredientsText
      .split("\n")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);

  const howToUse =
    howToUseText
      .split("\n")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);

  /* -----------------------------
     Upload image
  ------------------------------ */

  const adminSupabase =
    createAdminClient();

  const extension =
    imageFile.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "jpg";

  /*
    Unique filename prevents CDN
    cache problems and collisions.
  */

  const imagePath =
    `${slug}-${Date.now()}.${extension}`;

  const imageBuffer =
    Buffer.from(
      await imageFile.arrayBuffer()
    );

  const {
    error: uploadError,
  } = await adminSupabase.storage
    .from("product-images")
    .upload(
      imagePath,
      imageBuffer,
      {
        contentType:
          imageFile.type,

        cacheControl:
          "3600",

        upsert: false,
      }
    );

  if (uploadError) {
    console.error(
      "Product image upload error:",
      uploadError.message
    );

    throw new Error(
      `Unable to upload image: ${uploadError.message}`
    );
  }

  /* -----------------------------
     Get public image URL
  ------------------------------ */

  const {
    data: publicUrlData,
  } = adminSupabase.storage
    .from("product-images")
    .getPublicUrl(
      imagePath
    );

  const imageUrl =
    publicUrlData.publicUrl;

  /* -----------------------------
     Insert product
  ------------------------------ */

  const supabase =
    await createClient();

  const {
    error: productError,
  } = await supabase
    .from("products")
    .insert({
      name,
      slug,

      short_description:
        shortDescription || null,

      description:
        description || null,

      price,
      stock,

      image_url:
        imageUrl,

      size:
        size || null,

      benefits,
      ingredients,

      how_to_use:
        howToUse,

      active,
    });

  if (productError) {
    console.error(
      "Create product error:",
      productError.message
    );

    /*
      Product insert failed,
      so remove unused image.
    */

    await adminSupabase.storage
      .from("product-images")
      .remove([
        imagePath,
      ]);

    throw new Error(
      `Unable to create product: ${productError.message}`
    );
  }

  revalidatePath("/");
  revalidatePath(
    "/admin/products"
  );

  redirect(
    "/admin/products"
  );
}


export async function updateProduct(
  productId: number,
  formData: FormData
) {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  const name = String(formData.get("name") || "").trim();

  const shortDescription = String(
    formData.get("shortDescription") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

const imageFile =
  formData.get("image");

  const size = String(
    formData.get("size") || ""
  ).trim();

  const benefitsText = String(
    formData.get("benefits") || ""
  );

  const ingredientsText = String(
    formData.get("ingredients") || ""
  );

  const howToUseText = String(
    formData.get("howToUse") || ""
  );

  const active = formData.get("active") === "on";

  if (!name) {
    throw new Error("Product name is required.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Enter a valid product price.");
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Enter a valid stock quantity.");
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const benefits = benefitsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const ingredients = ingredientsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const howToUse = howToUseText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const supabase = await createClient();


  /* -----------------------------
    Get current product image
  ------------------------------ */

  const adminSupabase =
    createAdminClient();

  const {
    data: existingProduct,
    error: existingProductError,
  } = await adminSupabase
    .from("products")
    .select("image_url")
    .eq("id", productId)
    .maybeSingle();

  if (
    existingProductError ||
    !existingProduct
  ) {
    throw new Error(
      "Unable to load existing product."
    );
  }

  let imageUrl =
    existingProduct.image_url;

  /* -----------------------------
    Upload NEW image only
    if admin selected one
  ------------------------------ */
  let newImagePath: string | null =
  null;

  if (
    imageFile instanceof File &&
    imageFile.size > 0
  ) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        imageFile.type
      )
    ) {
      throw new Error(
        "Only JPG, PNG and WebP images are allowed."
      );
    }

    const maxFileSize =
      3 * 1024 * 1024;

    if (
      imageFile.size >
      maxFileSize
    ) {
      throw new Error(
        "Image must be smaller than 3 MB."
      );
    }

  const extension =
    imageFile.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "jpg";

  const imagePath =
    `${slug}-${Date.now()}.${extension}`;
  newImagePath = imagePath;

  const imageBuffer =
    Buffer.from(
      await imageFile.arrayBuffer()
    );

  const {
    error: uploadError,
  } = await adminSupabase.storage
    .from("product-images")
    .upload(
      imagePath,
      imageBuffer,
      {
        contentType:
          imageFile.type,

        cacheControl:
          "3600",

        upsert: false,
      }
    );

  if (uploadError) {
    console.error(
      "Update product image error:",
      uploadError.message
    );

    throw new Error(
      `Unable to upload image: ${uploadError.message}`
    );
  }

  const {
    data: publicUrlData,
  } = adminSupabase.storage
    .from("product-images")
    .getPublicUrl(
      imagePath
    );

  imageUrl =
    publicUrlData.publicUrl;
}





  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      short_description: shortDescription || null,
      description: description || null,
      price,
      stock,
      image_url: imageUrl || null,
      size: size || null,
      benefits,
      ingredients,
      how_to_use: howToUse,
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

if (error) {
  console.error(
    "Update product error:",
    error.message
  );

  /*
   * We uploaded a new image,
   * but the database update failed.
   *
   * Remove the unused new image.
   */
  if (newImagePath) {
    const {
      error: cleanupError,
    } = await adminSupabase.storage
      .from("product-images")
      .remove([
        newImagePath,
      ]);

    if (cleanupError) {
      console.error(
        "New image cleanup error:",
        cleanupError.message
      );
    }
  }

  throw new Error(
    `Unable to update product: ${error.message}`
  );
  
  
}



/*
 * Database update succeeded.
 *
 * If a new image was uploaded,
 * now remove the OLD image.
 */
if (
  newImagePath &&
  existingProduct.image_url
) {
  const oldImagePath =
    getProductImageStoragePath(
      existingProduct.image_url
    );

  if (
    oldImagePath &&
    oldImagePath !== newImagePath
  ) {
    const {
      error: oldImageDeleteError,
    } = await adminSupabase.storage
      .from("product-images")
      .remove([oldImagePath]);

    if (oldImageDeleteError) {
      /*
       * Do not fail the product update.
       * The database already points
       * to the new image.
       */
      console.error(
        "Old product image cleanup error:",
        oldImageDeleteError.message
      );
    }
  }
}

revalidatePath("/");
revalidatePath("/admin/products");
revalidatePath(`/products/${slug}`);

redirect("/admin/products");


}

export async function setProductActive(
  productId: number,
  active: boolean
) {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Get slug before updating
  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  const { error } = await supabase
    .from("products")
    .update({
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    console.error(
      "Product status update error:",
      error.message
    );

    throw new Error(
      `Unable to update product status: ${error.message}`
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/products");

  if (product?.slug) {
    revalidatePath(`/products/${product.slug}`);
  }
}
export async function deleteProduct(
  productId: number
) {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  const supabase =
    await createClient();

  const adminSupabase =
    createAdminClient();

  /*
   * Get product information BEFORE
   * deleting the database row.
   */
  const {
    data: product,
    error: productLoadError,
  } = await supabase
    .from("products")
    .select(`
      slug,
      image_url
    `)
    .eq("id", productId)
    .maybeSingle();

  if (
    productLoadError ||
    !product
  ) {
    console.error(
      "Load product before delete error:",
      productLoadError?.message
    );

    throw new Error(
      "Unable to load product."
    );
  }

  /*
   * Delete database product first.
   */
  const {
    error: deleteError,
  } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (deleteError) {
    console.error(
      "Delete product error:",
      deleteError.message
    );

    throw new Error(
      `Unable to delete product: ${deleteError.message}`
    );
  }

  /*
   * Database deletion succeeded.
   *
   * Now remove its Storage image,
   * but only if it is actually from
   * our product-images bucket.
   */
  const imagePath =
    getProductImageStoragePath(
      product.image_url
    );

  if (imagePath) {
    const {
      error: imageDeleteError,
    } = await adminSupabase.storage
      .from("product-images")
      .remove([
        imagePath,
      ]);

    if (imageDeleteError) {
      /*
       * Don't fail the entire deletion.
       * Product has already been removed
       * successfully from the database.
       */
      console.error(
        "Deleted product image cleanup error:",
        imageDeleteError.message
      );
    }
  }

  revalidatePath("/");
  revalidatePath(
    "/admin/products"
  );

  if (product.slug) {
    revalidatePath(
      `/products/${product.slug}`
    );
  }
}