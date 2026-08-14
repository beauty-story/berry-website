"use server";

import Razorpay from "razorpay";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

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
      razorpayOrderId: string;
      amountPaise: number;
    }
  | {
      success: false;
      error: string;
    };

export async function createOrder(
  input: CheckoutInput
): Promise<CreateOrderResult> {
  try {
    /* --------------------------------
       1. Validate customer details
    --------------------------------- */

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

    /* --------------------------------
       2. Validate cart
    --------------------------------- */

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

      Product 1 × 2
      Product 1 × 1

      becomes:

      Product 1 × 3
    */

    const quantityByProduct =
      new Map<number, number>();

    for (const item of input.items) {
      const existingQuantity =
        quantityByProduct.get(item.productId) ?? 0;

      quantityByProduct.set(
        item.productId,
        existingQuantity + item.quantity
      );
    }

    const productIds = Array.from(
      quantityByProduct.keys()
    );

    /* --------------------------------
       3. Get current signed-in user
    --------------------------------- */

    const userSupabase = await createClient();

    const {
      data: { user },
    } = await userSupabase.auth.getUser();

    /*
      Signed-in checkout:
      userId = UUID

      Guest checkout:
      userId = null
    */

    const userId = user?.id ?? null;

    /* --------------------------------
       4. Get REAL product information
    --------------------------------- */

    const adminSupabase =
      createAdminClient();

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
        "Checkout product error:",
        {
          message: productError.message,
          code: productError.code,
          details: productError.details,
          hint: productError.hint,
        }
      );

      return {
        success: false,
        error: `Unable to verify cart products: ${productError.message}`,
      };
    }

    if (!products) {
      return {
        success: false,
        error: "Unable to load products.",
      };
    }

    /*
      If browser sent 3 product IDs,
      database must return all 3.

      Otherwise a product may have been
      deleted or deactivated.
    */

    if (
      products.length !== productIds.length
    ) {
      return {
        success: false,
        error:
          "One or more products are no longer available.",
      };
    }

    /* --------------------------------
       5. Calculate REAL prices
    --------------------------------- */

    let subtotalPaise = 0;

    const orderItems: {
      product_id: number;
      product_name: string;
      product_size: string | null;
      unit_price: number;
      quantity: number;
    }[] = [];

    for (const product of products) {
      const quantity =
        quantityByProduct.get(product.id) ?? 0;

      if (quantity <= 0) {
        return {
          success: false,
          error: "Invalid product quantity.",
        };
      }

      if (quantity > product.stock) {
        return {
          success: false,
          error: `${product.name} does not have enough stock.`,
        };
      }

      const unitPrice =
        Number(product.price);

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
        Work in paise internally.

        ₹799
        becomes
        79900 paise
      */

      const unitPricePaise =
        Math.round(unitPrice * 100);

      subtotalPaise +=
        unitPricePaise * quantity;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_size:
          product.size ?? null,
        unit_price: unitPrice,
        quantity,
      });
    }

    const subtotal =
      subtotalPaise / 100;

    /*
      Temporary shipping amount.

      We will add the actual shipping
      calculation later.
    */

    const shippingAmount = 0;

    const total =
      subtotal + shippingAmount;

    /* --------------------------------
       6. Create local pending order
    --------------------------------- */

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
        address_line2:
          area || null,

        city,
        state,
        pincode,
        country: "India",

        subtotal,
        shipping_amount:
          shippingAmount,
        total_amount: total,

        payment_status: "pending",
        order_status: "new",

        shipping_provider:
          "India Post",
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

    /* --------------------------------
       7. Create order items
    --------------------------------- */

    const itemsWithOrderId =
      orderItems.map((item) => ({
        ...item,
        order_id: order.id,
      }));

    const {
      error: itemsError,
    } = await adminSupabase
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error(
        "Create order items error:",
        itemsError.message
      );

      /*
        Delete the parent order.

        order_items uses ON DELETE CASCADE.
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

    /* --------------------------------
       8. Check Razorpay configuration
    --------------------------------- */

    const razorpayKeyId =
      process.env
        .NEXT_PUBLIC_RAZORPAY_KEY_ID;

    const razorpayKeySecret =
      process.env
        .RAZORPAY_KEY_SECRET;

    if (
      !razorpayKeyId ||
      !razorpayKeySecret
    ) {
      console.error(
        "Razorpay keys are missing."
      );

      /*
        Cleanup because payment order
        cannot be created.
      */

      await adminSupabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      return {
        success: false,
        error:
          "Payment service is not configured.",
      };
    }

    /* --------------------------------
       9. Initialize Razorpay
    --------------------------------- */

    const razorpay =
      new Razorpay({
        key_id: razorpayKeyId,
        key_secret:
          razorpayKeySecret,
      });

    /*
      Razorpay expects INR in paise.

      Example:

      ₹799
      ↓
      79900
    */

    const amountPaise =
      Math.round(total * 100);

    /* --------------------------------
       10. Create Razorpay order
    --------------------------------- */

    let razorpayOrderId: string;

    try {
      const razorpayOrder =
        await razorpay.orders.create({
          amount: amountPaise,
          currency: "INR",

          receipt:
            `order_${order.id}`,

          notes: {
            local_order_id:
              String(order.id),
          },
        });

      razorpayOrderId =
        razorpayOrder.id;
    } catch (razorpayError) {
      console.error(
        "Razorpay order creation error:",
        razorpayError
      );

      /*
        Razorpay order failed,
        so remove our pending local order.
      */

      await adminSupabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      return {
        success: false,
        error:
          "Unable to create payment order.",
      };
    }

    /* --------------------------------
       11. Save Razorpay order ID
    --------------------------------- */

    const {
      error: paymentOrderError,
    } = await adminSupabase
      .from("orders")
      .update({
        payment_provider:
          "razorpay",

        payment_order_id:
          razorpayOrderId,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", order.id);

    if (paymentOrderError) {
      console.error(
        "Save Razorpay order error:",
        paymentOrderError.message
      );

      return {
        success: false,
        error:
          "Payment order was created but could not be saved.",
      };
    }

    /* --------------------------------
       12. Return payment information
    --------------------------------- */

    return {
      success: true,
      orderId: order.id,
      total,
      razorpayOrderId,
      amountPaise,
    };
  } catch (error) {
    /*
      THIS is the main catch.

      It must stay at the very bottom
      of createOrder().
    */

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

type VerifyPaymentInput = {
  localOrderId: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
};

type VerifyPaymentResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function verifyPayment(
  input: VerifyPaymentInput
): Promise<VerifyPaymentResult> {
  try {
    /* --------------------------------
       1. Validate input
    --------------------------------- */

    if (
      !Number.isInteger(input.localOrderId) ||
      !input.razorpayPaymentId ||
      !input.razorpayOrderId ||
      !input.razorpaySignature
    ) {
      return {
        success: false,
        error: "Invalid payment information.",
      };
    }

    const secret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return {
        success: false,
        error: "Payment service is not configured.",
      };
    }

    const adminSupabase =
      createAdminClient();

    /* --------------------------------
       2. Load our order
    --------------------------------- */

    const {
      data: order,
      error: orderError,
    } = await adminSupabase
      .from("orders")
      .select(`
        id,
        payment_order_id
      `)
      .eq("id", input.localOrderId)
      .maybeSingle();

    if (orderError || !order) {
      console.error(
        "Verify payment order error:",
        orderError?.message
      );

      return {
        success: false,
        error: "Order not found.",
      };
    }

    if (!order.payment_order_id) {
      return {
        success: false,
        error:
          "Payment order information is missing.",
      };
    }

    /* --------------------------------
       3. Compare Razorpay order IDs
    --------------------------------- */

    if (
      order.payment_order_id !==
      input.razorpayOrderId
    ) {
      console.error(
        "Razorpay order mismatch."
      );

      return {
        success: false,
        error: "Payment order mismatch.",
      };
    }

    /* --------------------------------
       4. Generate expected signature
    --------------------------------- */

    const body =
      `${order.payment_order_id}|${input.razorpayPaymentId}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          secret
        )
        .update(body)
        .digest("hex");

    /* --------------------------------
       5. Safely compare signatures
    --------------------------------- */

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        input.razorpaySignature,
        "utf8"
      );

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      return {
        success: false,
        error:
          "Payment verification failed.",
      };
    }

    const signatureValid =
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      console.error(
        "Invalid Razorpay signature."
      );

      return {
        success: false,
        error:
          "Payment verification failed.",
      };
    }

    /* --------------------------------
       6. Finalize order atomically
    --------------------------------- */

    const {
      error: finalizeError,
    } = await adminSupabase.rpc(
      "finalize_paid_order",
      {
        p_order_id:
          order.id,

        p_payment_id:
          input.razorpayPaymentId,
      }
    );

    if (finalizeError) {
      console.error(
        "Finalize paid order error:",
        finalizeError.message
      );

      return {
        success: false,
        error:
          "Payment was verified, but the order could not be finalized.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Verify payment error:",
      error
    );

    return {
      success: false,
      error:
        "Unable to verify payment.",
    };
  }
}