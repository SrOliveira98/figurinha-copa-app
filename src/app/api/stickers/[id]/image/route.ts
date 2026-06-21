import { NextResponse } from "next/server";

import { getImageFileName, getStickerRecord, readStickerImageFile } from "@/lib/storage";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(request: Request, { params }: RouteContext) {
  const sticker = await getStickerRecord(params.id);

  if (!sticker) {
    return NextResponse.json({ error: "Figurinha nao encontrada." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const variant = searchParams.get("variant") === "clean" ? "clean" : "preview";

  if (variant === "clean" && !sticker.paid) {
    return NextResponse.json({ error: "Pagamento ainda nao confirmado." }, { status: 403 });
  }

  if (
    variant === "clean" &&
    process.env.OPENAI_API_KEY &&
    sticker.premiumStatus !== "ready" &&
    sticker.premiumStatus !== "failed"
  ) {
    return NextResponse.json(
      { error: "Sua figurinha premium ainda esta sendo finalizada." },
      { status: 425 },
    );
  }

  const fileName = getImageFileName(sticker, variant);
  const imageBuffer = await readStickerImageFile(fileName);

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
