import { redirect } from "next/navigation";

import { SuccessClient } from "@/components/success-client";
import { getStickerBySessionId, markStickerAsPaid } from "@/lib/storage";
import { getStripeClient } from "@/lib/stripe";
import { buildPublicImageUrl } from "@/lib/utils";

type SuccessPageProps = {
  searchParams: {
    session_id?: string;
  };
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    redirect("/");
  }

  const stripe = getStripeClient();

  if (!stripe) {
    redirect("/");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const stickerId = session.metadata?.stickerId;

  if (!stickerId || session.payment_status !== "paid") {
    redirect("/");
  }

  const updatedRecord = await markStickerAsPaid(stickerId, {
    stripeSessionId: session.id,
    stripePaymentStatus: session.payment_status,
  });

  const sticker = updatedRecord ?? (await getStickerBySessionId(sessionId));

  if (!sticker || !sticker.paid) {
    redirect("/");
  }

  const downloadUrl = buildPublicImageUrl(sticker.id, "clean");

  return (
    <SuccessClient
      stickerId={sticker.id}
      fullName={sticker.fullName}
      cleanUrl={downloadUrl}
      initialPremiumStatus={sticker.premiumStatus}
      initialPremiumError={sticker.premiumError}
    />
  );
}
