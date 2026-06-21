export type StickerFormPayload = {
  firstName: string;
  lastName: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  heightCm: string;
  weightKg: string;
  team: string;
};

export type StickerRecord = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
  heightCm: number;
  weightKg: number;
  formattedHeight: string;
  formattedWeight: string;
  team: string;
  paid: boolean;
  createdAt: string;
  photoFileName: string;
  previewFileName: string;
  cleanFileName: string;
  premiumStatus: "not_started" | "processing" | "ready" | "failed";
  premiumError?: string;
  stripeSessionId?: string;
  stripePaymentStatus?: string;
};

export type StickerVariant = "preview" | "clean";
