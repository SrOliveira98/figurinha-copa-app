import { NextResponse } from "next/server";

import { getStickerRecord } from "@/lib/storage";
import { buildPublicImageUrl } from "@/lib/utils";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_: Request, { params }: RouteContext) {
  const sticker = await getStickerRecord(params.id);

  if (!sticker) {
    return NextResponse.json({ error: "Figurinha nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({
    id: sticker.id,
    fullName: sticker.fullName,
    team: sticker.team,
    paid: sticker.paid,
    premiumStatus: sticker.premiumStatus,
    premiumError: sticker.premiumError ?? null,
    previewUrl: buildPublicImageUrl(sticker.id, "preview"),
    cleanUrl: buildPublicImageUrl(sticker.id, "clean"),
  });
}
