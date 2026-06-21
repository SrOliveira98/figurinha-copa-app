import sharp from "sharp";

import { StickerRecord } from "@/lib/types";
import { escapeXml, formatStatsLine, getDisplayName } from "@/lib/utils";

const STICKER_WIDTH = 800;
const STICKER_HEIGHT = 1120;

function getTrophySvg() {
  return `
    <g transform="translate(610 48)" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
      <path d="M36 0h88v18c0 42-22 77-62 96C25 95 0 60 0 18V0h36" />
      <path d="M12 24c-18 0-32 8-32 28 0 31 34 42 54 32" />
      <path d="M148 24c18 0 32 8 32 28 0 31-34 42-54 32" />
      <path d="M62 114v30" />
      <path d="M96 114v30" />
      <path d="M38 172h82" />
    </g>
  `;
}

function buildBaseSvg(record: StickerRecord) {
  const playerName = escapeXml(getDisplayName(record.fullName));
  const stats = escapeXml(formatStatsLine(record));
  const team = escapeXml(record.team.toUpperCase());

  return `
    <svg width="${STICKER_WIDTH}" height="${STICKER_HEIGHT}" viewBox="0 0 ${STICKER_WIDTH} ${STICKER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#13D1D6" />
          <stop offset="100%" stop-color="#00A7B1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="36" fill="url(#bgGradient)" />
      <text x="40" y="260" fill="#005F00" fill-opacity="0.20" font-size="300" font-weight="900" font-family="Arial, sans-serif">26</text>
      <text x="40" y="560" fill="#005F00" fill-opacity="0.20" font-size="300" font-weight="900" font-family="Arial, sans-serif">26</text>
      <text x="40" y="860" fill="#005F00" fill-opacity="0.20" font-size="300" font-weight="900" font-family="Arial, sans-serif">26</text>

      ${getTrophySvg()}
      <text x="700" y="110" fill="#FFFFFF" text-anchor="middle" font-size="52" font-weight="900" font-family="Arial, sans-serif">FIFA</text>
      <text x="700" y="164" fill="#FFFFFF" text-anchor="middle" font-size="64" font-weight="900" font-family="Arial, sans-serif">26</text>

      <rect x="120" y="210" width="500" height="600" rx="28" fill="#FFFFFF" fill-opacity="0.16" />
      <rect x="126" y="216" width="488" height="588" rx="24" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.30" />

      <g transform="translate(670 310)">
        <circle cx="0" cy="0" r="76" fill="#FFFFFF" fill-opacity="0.15"/>
        <clipPath id="flagClip">
          <circle cx="0" cy="0" r="66" />
        </clipPath>
        <g clip-path="url(#flagClip)">
          <rect x="-66" y="-66" width="132" height="132" fill="#009C3B" />
          <polygon points="0,-46 56,0 0,46 -56,0" fill="#FFDF00" />
          <circle cx="0" cy="0" r="28" fill="#002776" />
          <path d="M-30 -4c20 -16 60 -16 80 0" stroke="#FFFFFF" stroke-width="6" fill="none" />
        </g>
        <circle cx="0" cy="0" r="66" fill="none" stroke="#FFFFFF" stroke-width="6" />
      </g>
      <text x="712" y="560" fill="#FFFFFF" font-size="52" font-weight="900" font-family="Arial, sans-serif" transform="rotate(90 712 560)">BRA</text>

      <rect x="0" y="840" width="${STICKER_WIDTH}" height="280" rx="0" fill="#002050" />
      <text x="54" y="936" fill="#FFFFFF" font-size="76" font-weight="900" letter-spacing="2" font-family="Impact, Arial Black, sans-serif">${playerName}</text>
      <text x="54" y="998" fill="#FFFFFF" font-size="32" font-weight="700" font-family="Arial, sans-serif">${stats}</text>
      <text x="54" y="1052" fill="#D7E3FF" font-size="28" font-weight="700" letter-spacing="1.5" font-family="Arial, sans-serif">${team}</text>
      <text x="734" y="1050" fill="#FFDF00" text-anchor="end" font-size="42" font-weight="700" font-family="Georgia, Times New Roman, serif">PANINI</text>
    </svg>
  `;
}

function buildWatermarkSvg() {
  const lines = Array.from({ length: 7 }, (_, index) => {
    const y = 140 + index * 140;
    return `<text x="-180" y="${y}" fill="#FFFFFF" fill-opacity="0.44" font-size="54" font-weight="900" font-family="Arial, sans-serif">MINHA FIGURINHA 2026  MINHA FIGURINHA 2026  MINHA FIGURINHA 2026</text>`;
  }).join("");

  return `
    <svg width="${STICKER_WIDTH}" height="${STICKER_HEIGHT}" viewBox="0 0 ${STICKER_WIDTH} ${STICKER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-27 400 560)">
        ${lines}
      </g>
    </svg>
  `;
}

async function normalizeStickerImage(imageBuffer: Buffer) {
  return sharp(imageBuffer)
    .resize(STICKER_WIDTH, STICKER_HEIGHT, {
      fit: "cover",
      position: "attention",
    })
    .png()
    .toBuffer();
}

async function buildPlayerImage(photoBuffer: Buffer) {
  return sharp(photoBuffer)
    .resize(500, 600, {
      fit: "cover",
      position: "attention",
    })
    .modulate({
      brightness: 1.04,
      saturation: 1.05,
    })
    .png()
    .toBuffer();
}

export async function applyPreviewWatermark(cleanImageBuffer: Buffer) {
  const normalized = await normalizeStickerImage(cleanImageBuffer);
  const watermarkSvg = Buffer.from(buildWatermarkSvg());
  const blurOverlay = {
    input: {
      create: {
        width: STICKER_WIDTH,
        height: STICKER_HEIGHT,
        channels: 4,
        background: {
          r: 255,
          g: 255,
          b: 255,
          alpha: 0.08,
        },
      },
    },
  } as const;

  return sharp(normalized)
    .blur(5.5)
    .composite([blurOverlay, { input: watermarkSvg }])
    .png()
    .toBuffer();
}

export async function generateStickerImages(record: StickerRecord, photoBuffer: Buffer) {
  const playerImage = await buildPlayerImage(photoBuffer);
  const baseSvg = Buffer.from(buildBaseSvg(record));

  const clean = await sharp({
    create: {
      width: STICKER_WIDTH,
      height: STICKER_HEIGHT,
      channels: 4,
      background: "#00C4C8",
    },
  })
    .composite([
      { input: baseSvg },
      { input: playerImage, top: 220, left: 120 },
    ])
    .png()
    .toBuffer();

  const preview = await applyPreviewWatermark(clean);

  return { clean, preview };
}
