import { StickerRecord } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function sanitizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function formatBirthDate(day: string, month: string, year: string) {
  return `${Number(day)}-${Number(month)}-${year}`;
}

export function formatHeight(heightCm: number) {
  return `${(heightCm / 100).toFixed(2).replace(".", ",")}m`;
}

export function formatWeight(weightKg: number) {
  return `${weightKg} kg`;
}

export function formatStatsLine(record: Pick<StickerRecord, "birthDate" | "formattedHeight" | "formattedWeight">) {
  return `${record.birthDate} | ${record.formattedHeight} | ${record.formattedWeight}`;
}

export function getDisplayName(fullName: string) {
  return sanitizeText(fullName).toUpperCase();
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase();
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildPublicImageUrl(id: string, variant: "preview" | "clean") {
  return `/api/stickers/${id}/image?variant=${variant}`;
}

export function formatPriceBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
