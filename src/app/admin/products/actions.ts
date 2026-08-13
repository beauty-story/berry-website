"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/isAdmin";
import { createClient } from "@/lib/supabase/server";

export async function createProduct(formData: FormData) {
  // Security check
  const admin = await isAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  // Get form values
  const name = String(formData.get("name") || "").trim();
  const shortDescription = String(
    formData.get("shortDescription") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

  const imageUrl = String(
    formData.get("imageUrl") || ""
  ).trim();

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

  // Basic validation
  if (!name) {
    throw new Error("Product name is required.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Enter a valid product price.");
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Enter a valid stock quantity.");
  }

  // Generate slug from product name
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Convert textarea lines into arrays
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

  const { error } = await supabase
    .from("products")
    .insert({
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
    });

  if (error) {
    console.error("Create product error:", error.message);

    throw new Error(
      `Unable to create product: ${error.message}`
    );
  }

  // Refresh pages that display products
  revalidatePath("/");
  revalidatePath("/admin/products");

  redirect("/admin/products");
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

  const imageUrl = String(
    formData.get("imageUrl") || ""
  ).trim();

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

    throw new Error(
      `Unable to update product: ${error.message}`
    );
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

  const supabase = await createClient();

  // Save slug before deletion
  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error(
      "Delete product error:",
      error.message
    );

    throw new Error(
      `Unable to delete product: ${error.message}`
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/products");

  if (product?.slug) {
    revalidatePath(`/products/${product.slug}`);
  }
}