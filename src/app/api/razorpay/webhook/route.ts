import crypto from "crypto";

import { createAdminClient } from "@/lib/supabase/admin";

type RazorpayWebhookPayload = {
  event?: string;

  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };

    order?: {
      entity?: {
        id?: string;
        status?: string;
      };
    };
  };
};

export async function POST(
  request: Request
) {
  try {
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is missing."
      );

      return new Response(
        "Webhook not configured",
        {
          status: 500,
        }
      );
    }

    /*
     * IMPORTANT:
     *
     * Read the RAW request body first.
     * Do not call request.json()
     * before verifying the signature.
     */
    const rawBody =
      await request.text();

    const receivedSignature =
      request.headers.get(
        "x-razorpay-signature"
      );

    if (!receivedSignature) {
      return new Response(
        "Missing signature",
        {
          status: 400,
        }
      );
    }

    /*
     * Generate expected webhook signature.
     */
    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          webhookSecret
        )
        .update(rawBody)
        .digest("hex");

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        receivedSignature,
        "utf8"
      );

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      return new Response(
        "Invalid signature",
        {
          status: 400,
        }
      );
    }

    const signatureValid =
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      console.error(
        "Invalid Razorpay webhook signature."
      );

      return new Response(
        "Invalid signature",
        {
          status: 400,
        }
      );
    }

    /*
     * Signature is valid.
     *
     * Now it is safe to parse JSON.
     */
    const event =
      JSON.parse(
        rawBody
      ) as RazorpayWebhookPayload;

    /*
     * We only need order.paid for now.
     */
    if (event.event !== "order.paid") {
      return Response.json({
        received: true,
      });
    }

    const razorpayOrderId =
      event.payload?.order?.entity?.id ??
      event.payload?.payment?.entity
        ?.order_id;

    const razorpayPaymentId =
      event.payload?.payment?.entity?.id;

    if (
      !razorpayOrderId ||
      !razorpayPaymentId
    ) {
      console.error(
        "Webhook payment information missing."
      );

      return new Response(
        "Invalid webhook payload",
        {
          status: 400,
        }
      );
    }

    const adminSupabase =
      createAdminClient();

    /*
     * Find our local order using the
     * Razorpay order ID.
     */
    const {
      data: order,
      error: orderError,
    } = await adminSupabase
      .from("orders")
      .select(`
        id,
        payment_status
      `)
      .eq(
        "payment_order_id",
        razorpayOrderId
      )
      .maybeSingle();

    if (orderError) {
      console.error(
        "Webhook order lookup error:",
        orderError.message
      );

      return new Response(
        "Database error",
        {
          status: 500,
        }
      );
    }

    /*
     * Unknown Razorpay order:
     * acknowledge it so Razorpay does
     * not retry forever.
     */
    if (!order) {
      console.warn(
        "Webhook received for unknown order:",
        razorpayOrderId
      );

      return Response.json({
        received: true,
      });
    }

    /*
     * finalize_paid_order() is already
     * idempotent.
     *
     * If the browser already finalized
     * the order, this safely does nothing.
     */
    const {
      error: finalizeError,
    } = await adminSupabase.rpc(
      "finalize_paid_order",
      {
        p_order_id:
          order.id,

        p_payment_id:
          razorpayPaymentId,
      }
    );

    if (finalizeError) {
      console.error(
        "Webhook finalize error:",
        finalizeError.message
      );

      /*
       * Return non-2xx so Razorpay
       * retries this webhook.
       */
      return new Response(
        "Unable to finalize order",
        {
          status: 500,
        }
      );
    }

    console.log(
      "Razorpay webhook processed:",
      {
        localOrderId:
          order.id,

        razorpayOrderId,

        razorpayPaymentId,
      }
    );

    return Response.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Razorpay webhook error:",
      error
    );

    return new Response(
      "Webhook processing failed",
      {
        status: 500,
      }
    );
  }
}