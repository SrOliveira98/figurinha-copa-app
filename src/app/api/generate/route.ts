import { NextResponse } from "next/server";

import { generateStickerWithOpenAI } from "@/lib/openai-image";
import { applyPreviewWatermark, generateStickerImages } from "@/lib/sticker";
import { saveGeneratedImages, saveStickerRecord, saveUploadFile } from "@/lib/storage";
import { StickerRecord } from "@/lib/types";
import { formatBirthDate, formatHeight, formatWeight, sanitizeText } from "@/lib/utils";

export const runtime = "nodejs";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo");

    if (!(photo instanceof File)) {
      return NextResponse.json({ error: "Envie uma foto valida." }, { status: 400 });
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
      return NextResponse.json({ error: "Formato de foto nao suportado." }, { status: 400 });
    }

    if (photo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "A foto deve ter no maximo 10MB." }, { status: 400 });
    }

    const firstName = sanitizeText(getString(formData, "firstName"));
    const lastName = sanitizeText(getString(formData, "lastName"));
    const birthDay = sanitizeText(getString(formData, "birthDay"));
    const birthMonth = sanitizeText(getString(formData, "birthMonth"));
    const birthYear = sanitizeText(getString(formData, "birthYear"));
    const team = sanitizeText(getString(formData, "team"));
    const heightCm = Number(getString(formData, "heightCm"));
    const weightKg = Number(getString(formData, "weightKg"));

    if (!firstName || !lastName || !birthDay || !birthMonth || !birthYear || !team) {
      return NextResponse.json({ error: "Preencha todos os dados do craque." }, { status: 400 });
    }

    if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
      return NextResponse.json({ error: "Altura e peso devem ser numericos." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const photoBuffer = Buffer.from(await photo.arrayBuffer());
    const photoMimeType = photo.type;
    const photoExtension = photo.type === "image/png" ? ".png" : photo.type === "image/webp" ? ".webp" : ".jpg";
    const photoFileName = await saveUploadFile(id, photoExtension, photoBuffer);

    const record: StickerRecord = {
      id,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      birthDate: formatBirthDate(birthDay, birthMonth, birthYear),
      heightCm,
      weightKg,
      formattedHeight: formatHeight(heightCm),
      formattedWeight: formatWeight(weightKg),
      team,
      paid: false,
      createdAt: new Date().toISOString(),
      photoFileName,
      previewFileName: "",
      cleanFileName: "",
      premiumStatus: "ready",
    };

    const openAiImage = await generateStickerWithOpenAI(record, photoBuffer, photoMimeType);
    const images = openAiImage
      ? {
          clean: openAiImage,
          preview: await applyPreviewWatermark(openAiImage),
        }
      : await generateStickerImages(record, photoBuffer);
    const generatedFiles = await saveGeneratedImages(id, images);

    const finalRecord: StickerRecord = {
      ...record,
      previewFileName: generatedFiles.previewFileName,
      cleanFileName: generatedFiles.cleanFileName,
    };

    await saveStickerRecord(finalRecord);

    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Nao foi possivel gerar a figurinha agora.",
      },
      { status: 500 },
    );
  }
}
