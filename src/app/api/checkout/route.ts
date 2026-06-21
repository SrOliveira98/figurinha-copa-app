import { NextResponse } from "next/server";

import { getStickerRecord, updateStripeSession } from "@/lib/storage";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

function getBaseUrl(request: Request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    new URL(request.url).origin
  );
}

export async function POST(request: Request) {
  try {
    const { stickerId } = (await request.json()) as { stickerId?: string };

    if (!stickerId) {
      return NextResponse.json({ error: "Informe o ID da figurinha." }, { status: 400 });
    }

    const sticker = await getStickerRecord(stickerId);

    if (!sticker) {
      return NextResponse.json({ error: "Figurinha nao encontrada." }, { status: 404 });
    }

    const stripe = getStripeClient();

    if (!stripe) {
      return NextResponse.json(
        {
          error:
            "Configure STRIPE_SECRET_KEY e NEXT_PUBLIC_SITE_URL para habilitar o checkout hospedado.",
        },
        { status: 500 },
      );
    }

    const baseUrl = getBaseUrl(request);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${baseUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/preview?id=${sticker.id}`,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Figurinha Personalizada Copa 2026 - sem marca d'agua",
              description: `Download da figurinha de ${sticker.fullName} sem marca d'agua.`,
            },
            unit_amount: 990,
          },
          quantity: 1,
        },
      ],
      metadata: {
        stickerId: sticker.id,
      },
    });

    await updateStripeSession(sticker.id, session.id, session.payment_status ?? "unpaid");

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Nao foi possivel iniciar o checkout.",
      },
      { status: 500 },
    );
  }
}
