import { NextResponse } from "next/server";

import { generateStickerWithOpenAI } from "@/lib/openai-image";
import { getStickerRecord, overwriteCleanImage, readUploadFile, updatePremiumStatus } from "@/lib/storage";

type RouteContext = {
  params: {
    id: string;
  };
};

function getMimeTypeFromFileName(fileName: string) {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".png")) {
    return "image/png";
  }

  if (lower.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}

export async function POST(_: Request, { params }: RouteContext) {
  const sticker = await getStickerRecord(params.id);

  if (!sticker) {
    return NextResponse.json({ error: "Figurinha nao encontrada." }, { status: 404 });
  }

  if (!sticker.paid) {
    return NextResponse.json({ error: "Pagamento ainda nao confirmado." }, { status: 403 });
  }

  if (!process.env.OPENAI_API_KEY) {
    await updatePremiumStatus(sticker.id, { premiumStatus: "ready", premiumError: undefined });
    return NextResponse.json({ status: "ready", usedOpenAI: false });
  }

  if (sticker.premiumStatus === "ready") {
    return NextResponse.json({ status: "ready", usedOpenAI: true });
  }

  if (sticker.premiumStatus === "processing") {
    return NextResponse.json({ status: "processing", usedOpenAI: true });
  }

  await updatePremiumStatus(sticker.id, {
    premiumStatus: "processing",
    premiumError: undefined,
  });

  try {
    const photoBuffer = await readUploadFile(sticker.photoFileName);
    const generatedImage = await generateStickerWithOpenAI(
      sticker,
      photoBuffer,
      getMimeTypeFromFileName(sticker.photoFileName),
    );

    if (!generatedImage) {
      await updatePremiumStatus(sticker.id, { premiumStatus: "ready", premiumError: undefined });
      return NextResponse.json({ status: "ready", usedOpenAI: false });
    }

    const cleanFileName = await overwriteCleanImage(sticker.id, generatedImage);
    await updatePremiumStatus(sticker.id, {
      premiumStatus: "ready",
      premiumError: undefined,
      cleanFileName,
    });

    return NextResponse.json({ status: "ready", usedOpenAI: true });
  } catch (error) {
    await updatePremiumStatus(sticker.id, {
      premiumStatus: "failed",
      premiumError:
        error instanceof Error ? error.message : "Nao foi possivel finalizar a figurinha premium.",
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Nao foi possivel finalizar a figurinha premium.",
        status: "failed",
      },
      { status: 500 },
    );
  }
}
