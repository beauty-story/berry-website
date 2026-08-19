"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/isAdmin";
import { createClient } from "@/lib/supabase/server";



type OrderStatus =
  | "new"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export async function updateOrderStatus(
  orderId: number,
  formData: FormData
) {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  const status = String(
    formData.get("orderStatus") || ""
  ) as OrderStatus;

  const allowedStatuses: OrderStatus[] = [
    "new",
    "processing",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid order status.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      order_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error(
      "Update order status error:",
      error.message
    );

    throw new Error(
      "Unable to update order status."
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath(
    `/admin/orders/${orderId}`
  );
}






export async function updateTracking(
  orderId: number,
  formData: FormData
) {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  const shippingProvider = String(
    formData.get("shippingProvider") ||
      "India Post"
  ).trim();

  const trackingNumber = String(
    formData.get("trackingNumber") || ""
  ).trim();

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      shipping_provider:
        shippingProvider || "India Post",

      tracking_number:
        trackingNumber || null,

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error(
      "Update tracking error:",
      error.message
    );

    throw new Error(
      "Unable to update tracking information."
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath(
    `/admin/orders/${orderId}`
  );
}