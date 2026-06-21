import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { markStickerAsPaid } from "@/lib/storage";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook do Stripe nao configurado." },
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Assinatura do Stripe ausente." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assinatura invalida." },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const stickerId = session.metadata?.stickerId;

    if (stickerId) {
      await markStickerAsPaid(stickerId, {
        stripeSessionId: session.id,
        stripePaymentStatus: session.payment_status ?? "paid",
      });
    }
  }

  return NextResponse.json({ received: true });
}
