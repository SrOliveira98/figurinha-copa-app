import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

import { StickerRecord } from "@/lib/types";

const OPENAI_IMAGE_ENDPOINT = "https://api.openai.com/v1/images/edits";

function buildPrompt(record: StickerRecord) {
  return [
    "Use a primeira imagem como referencia principal do layout completo da figurinha.",
    "Use a segunda imagem para substituir o jogador pela pessoa enviada.",
    "Mantenha o estilo da figurinha, enquadramento, escudo, fundo, bandeira, elemento FIFA 26 e composicao visual o mais fiel possivel a referencia.",
    `Troque os textos para: nome ${record.fullName.toUpperCase()}, data ${record.birthDate}, altura ${record.formattedHeight}, peso ${record.formattedWeight}, time ${record.team.toUpperCase()}.`,
    "Garanta que todos os textos estejam legiveis e que a arte final seja uma figurinha vertical completa, pronta para uso.",
    "Nao adicione novos elementos fora do layout da referencia.",
    'Prompt original do projeto: "Quero que voce subistitua o jogador dessa foto por essa outra pessoa, garanta que as informacoes da imagem tambem mudem, como o nome, sobrenome, peso, altura e etc. E imprescindivel que voce garanta que todos os textos estejam legiveis e apenas a pessoa (juntamente das informacoes aqui dispostas) mude. todo o restante deve permanecer exatamente igual."',
  ].join(" ");
}

async function loadReferenceImageBuffer() {
  const candidatePaths = [
    path.join(process.cwd(), "public", "reais", "1.png"),
    path.join(process.cwd(), "public", "examples", "joao-mendes.svg"),
  ];

  for (const candidatePath of candidatePaths) {
    try {
      return {
        buffer: await readFile(candidatePath),
        fileName: path.basename(candidatePath),
        contentType: candidatePath.endsWith(".svg") ? "image/svg+xml" : "image/png",
      };
    } catch {
      // Try next available reference image.
    }
  }

  throw new Error("Nenhuma imagem de referencia foi encontrada para a edicao com OpenAI.");
}

async function optimizeReferenceImage(imageBuffer: Buffer) {
  return sharp(imageBuffer)
    .resize(1024, 1536, {
      fit: "cover",
      position: "attention",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
}

async function optimizeUserPhoto(imageBuffer: Buffer) {
  return sharp(imageBuffer)
    .resize(1024, 1024, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 86,
      mozjpeg: true,
    })
    .toBuffer();
}

export async function generateStickerWithOpenAI(
  record: StickerRecord,
  userPhotoBuffer: Buffer,
  userPhotoMimeType: string,
) {
  void userPhotoMimeType;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const referenceImage = await loadReferenceImageBuffer();
  const optimizedReferenceImage = await optimizeReferenceImage(referenceImage.buffer);
  const optimizedUserPhoto = await optimizeUserPhoto(userPhotoBuffer);
  const formData = new FormData();

  formData.append("model", process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5");
  formData.append("prompt", buildPrompt(record));
  formData.append("quality", process.env.OPENAI_IMAGE_QUALITY ?? "medium");
  formData.append("size", "1024x1536");
  formData.append("output_format", "png");
  formData.append("input_fidelity", "high");
  formData.append(
    "image[]",
    new Blob([new Uint8Array(optimizedReferenceImage)], { type: "image/png" }),
    "reference.png",
  );
  formData.append(
    "image[]",
    new Blob([new Uint8Array(optimizedUserPhoto)], { type: "image/jpeg" }),
    "user-photo.jpg",
  );

  const response = await fetch(OPENAI_IMAGE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao gerar com OpenAI: ${errorText}`);
  }

  const result = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };

  const firstImage = result.data?.[0];

  if (!firstImage) {
    throw new Error("A OpenAI nao retornou nenhuma imagem para a figurinha.");
  }

  if (firstImage.b64_json) {
    return Buffer.from(firstImage.b64_json, "base64");
  }

  if (firstImage.url) {
    const imageResponse = await fetch(firstImage.url);

    if (!imageResponse.ok) {
      throw new Error("A URL da imagem retornada pela OpenAI nao pode ser baixada.");
    }

    return Buffer.from(await imageResponse.arrayBuffer());
  }

  throw new Error("Resposta de imagem da OpenAI em formato nao suportado.");
}
