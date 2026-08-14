"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CartInput = {
  productId: number;
  quantity: number;
};

type CheckoutInput = {
  email: string;
  phone: string;
  fullName: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;

  items: CartInput[];
};

type CreateOrderResult =
  | {
      success: true;
      orderId: number;
      total: number;
    }
  | {
      success: false;
      error: string;
    };

export async function createOrder(
  input: CheckoutInput
): Promise<CreateOrderResult> {
  try {
    /* -----------------------------
       1. Validate customer details
    ------------------------------ */

    const email = input.email.trim();
    const phone = input.phone.trim();
    const fullName = input.fullName.trim();
    const address = input.address.trim();
    const area = input.area.trim();
    const city = input.city.trim();
    const state = input.state.trim();
    const pincode = input.pincode.trim();

    if (!fullName) {
      return {
        success: false,
        error: "Full name is required.",
      };
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return {
        success: false,
        error: "Enter a valid email address.",
      };
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return {
        success: false,
        error: "Enter a valid Indian phone number.",
      };
    }

    if (!address) {
      return {
        success: false,
        error: "Address is required.",
      };
    }

    if (!city) {
      return {
        success: false,
        error: "City is required.",
      };
    }

    if (!state) {
      return {
        success: false,
        error: "State is required.",
      };
    }

    if (!/^\d{6}$/.test(pincode)) {
      return {
        success: false,
        error: "Enter a valid 6-digit PIN code.",
      };
    }

    if (!input.items.length) {
      return {
        success: false,
        error: "Your cart is empty.",
      };
    }

    /* -----------------------------
       2. Validate cart quantities
    ------------------------------ */

    for (const item of input.items) {
      if (
        !Number.isInteger(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return {
          success: false,
          error: "Invalid cart item.",
        };
      }
    }

    /*
      Combine duplicate product IDs.

      Example:
      product 1 × 2
      product 1 × 1

      becomes:

      product 1 × 3
    */

    const quantityByProduct = new Map<number, number>();

    for (const item of input.items) {
      const existing =
        quantityByProduct.get(item.productId) ?? 0;

      quantityByProduct.set(
        item.productId,
        existing + item.quantity
      );
    }

    const productIds = Array.from(
      quantityByProduct.keys()
    );

    /* -----------------------------
       3. Determine logged-in user
    ------------------------------ */

    const userSupabase = await createClient();

    const {
      data: { user },
    } = await userSupabase.auth.getUser();

    const userId = user?.id ?? null;

    /* -----------------------------
       4. Load REAL product data
       using trusted server client
    ------------------------------ */

    const adminSupabase = createAdminClient();

    const {
      data: products,
      error: productError,
    } = await adminSupabase
      .from("products")
      .select(`
        id,
        name,
        price,
        size,
        stock,
        active
      `)
      .in("id", productIds)
      .eq("active", true);

    if (productError) {
      console.error(
        "Checkout product error:",{
          message: productError.message,
          code:productError.code,
          details:productError.details,
          hint:productError.hint,
        }
        
      );

      return {
        success: false,
        error: `Unable to verify cart products:${productError.message}`,
      };
    }

    if (!products) {
      return {
        success: false,
        error: "Unable to load products.",
      };
    }

    /*
      Every requested product must still exist
      and be active.
    */

    if (products.length !== productIds.length) {
      return {
        success: false,
        error:
          "One or more products are no longer available.",
      };
    }

    /* -----------------------------
       5. Calculate REAL prices
    ------------------------------ */

    let subtotalPaise = 0;

    const orderItems = [];

    for (const product of products) {
      const quantity =
        quantityByProduct.get(product.id) ?? 0;

      if (quantity > product.stock) {
        return {
          success: false,
          error: `${product.name} does not have enough stock.`,
        };
      }

      const unitPrice = Number(product.price);

      if (
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        return {
          success: false,
          error: `Invalid price for ${product.name}.`,
        };
      }

      /*
        Calculate money in paise internally
        to reduce floating-point problems.
      */

      const unitPricePaise =
        Math.round(unitPrice * 100);

      subtotalPaise +=
        unitPricePaise * quantity;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_size: product.size,
        unit_price: unitPrice,
        quantity,
      });
    }

    const subtotal =
      subtotalPaise / 100;

    /*
      Temporary for now.

      We will define the actual India Post
      shipping rule before payment.
    */

    const shippingAmount = 0;

    const total =
      subtotal + shippingAmount;

    /* -----------------------------
       6. Create pending order
    ------------------------------ */

    const {
      data: order,
      error: orderError,
    } = await adminSupabase
      .from("orders")
      .insert({
        user_id: userId,

        customer_name: fullName,
        email,
        phone,

        address_line1: address,
        address_line2: area || null,

        city,
        state,
        pincode,
        country: "India",

        subtotal,
        shipping_amount: shippingAmount,
        total_amount: total,

        payment_status: "pending",
        order_status: "new",

        shipping_provider: "India Post",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error(
        "Create order error:",
        orderError?.message
      );

      return {
        success: false,
        error: "Unable to create order.",
      };
    }

    /* -----------------------------
       7. Create order items
    ------------------------------ */

    const itemsWithOrderId =
      orderItems.map((item) => ({
        ...item,
        order_id: order.id,
      }));

    const { error: itemsError } =
      await adminSupabase
        .from("order_items")
        .insert(itemsWithOrderId);

    if (itemsError) {
      console.error(
        "Create order items error:",
        itemsError.message
      );

      /*
        Cleanup so we don't leave an
        empty/half-created order.
      */

      await adminSupabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      return {
        success: false,
        error:
          "Unable to save order items.",
      };
    }

    return {
      success: true,
      orderId: order.id,
      total,
    };
  } catch (error) {
    console.error(
      "Checkout error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while creating the order.",
    };
  }
}