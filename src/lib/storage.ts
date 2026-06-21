import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

import { StickerRecord, StickerVariant } from "@/lib/types";

const storageRoot = path.join(process.cwd(), "storage");
const uploadsDir = path.join(storageRoot, "uploads");
const generatedDir = path.join(storageRoot, "generated");
const dbPath = path.join(storageRoot, "figurinha-records.json");

type StickerDatabase = Record<string, StickerRecord>;
const TEMP_FILE_TTL_MS = 24 * 60 * 60 * 1000;

function normalizeRecord(record: StickerRecord): StickerRecord {
  return {
    ...record,
    premiumStatus: record.premiumStatus ?? "not_started",
    premiumError: record.premiumError,
  };
}

async function ensureStorage() {
  await mkdir(uploadsDir, { recursive: true });
  await mkdir(generatedDir, { recursive: true });

  try {
    await readFile(dbPath, "utf8");
  } catch {
    await writeFile(dbPath, JSON.stringify({}, null, 2), "utf8");
  }
}

async function readDatabase() {
  await ensureStorage();
  const raw = await readFile(dbPath, "utf8");
  const database = JSON.parse(raw) as StickerDatabase;
  await cleanupExpiredRecords(database);
  return database;
}

async function writeDatabase(database: StickerDatabase) {
  await ensureStorage();
  await writeFile(dbPath, JSON.stringify(database, null, 2), "utf8");
}

async function removeFileIfExists(filePath: string) {
  try {
    await unlink(filePath);
  } catch {
    // Ignore missing files during background cleanup.
  }
}

async function cleanupExpiredRecords(database: StickerDatabase) {
  const now = Date.now();
  let changed = false;

  for (const [id, record] of Object.entries(database)) {
    const createdAt = new Date(record.createdAt).getTime();

    if (Number.isNaN(createdAt)) {
      continue;
    }

    if (now - createdAt < TEMP_FILE_TTL_MS) {
      continue;
    }

    changed = true;
    delete database[id];

    await Promise.all([
      removeFileIfExists(path.join(uploadsDir, record.photoFileName)),
      removeFileIfExists(path.join(generatedDir, record.previewFileName)),
      removeFileIfExists(path.join(generatedDir, record.cleanFileName)),
    ]);
  }

  if (changed) {
    await writeDatabase(database);
  }
}

export async function saveUploadFile(id: string, fileExtension: string, fileBuffer: Buffer) {
  await ensureStorage();
  const fileName = `${id}${fileExtension}`;
  await writeFile(path.join(uploadsDir, fileName), fileBuffer);
  return fileName;
}

export async function saveGeneratedImages(
  id: string,
  images: { preview: Buffer; clean: Buffer },
) {
  await ensureStorage();

  const previewFileName = `${id}-preview.png`;
  const cleanFileName = `${id}-clean.png`;

  await writeFile(path.join(generatedDir, previewFileName), images.preview);
  await writeFile(path.join(generatedDir, cleanFileName), images.clean);

  return { previewFileName, cleanFileName };
}

export async function overwriteCleanImage(id: string, cleanImageBuffer: Buffer) {
  await ensureStorage();
  const cleanFileName = `${id}-clean.png`;
  await writeFile(path.join(generatedDir, cleanFileName), cleanImageBuffer);
  return cleanFileName;
}

export async function saveStickerRecord(record: StickerRecord) {
  const database = await readDatabase();
  database[record.id] = record;
  await writeDatabase(database);
}

export async function getStickerRecord(id: string) {
  const database = await readDatabase();
  const record = database[id];
  return record ? normalizeRecord(record) : null;
}

export async function getStickerBySessionId(sessionId: string) {
  const database = await readDatabase();
  return (
    Object.values(database)
      .map(normalizeRecord)
      .find((record) => record.stripeSessionId === sessionId) ?? null
  );
}

export async function markStickerAsPaid(
  id: string,
  payload: { stripeSessionId?: string; stripePaymentStatus?: string } = {},
) {
  const database = await readDatabase();
  const currentRecord = database[id];

  if (!currentRecord) {
    return null;
  }

  const updatedRecord: StickerRecord = {
    ...currentRecord,
    paid: true,
    stripeSessionId: payload.stripeSessionId ?? currentRecord.stripeSessionId,
    stripePaymentStatus:
      payload.stripePaymentStatus ?? currentRecord.stripePaymentStatus ?? "paid",
  };

  database[id] = updatedRecord;
  await writeDatabase(database);
  return updatedRecord;
}

export async function updatePremiumStatus(
  id: string,
  payload: {
    premiumStatus: StickerRecord["premiumStatus"];
    premiumError?: string;
    cleanFileName?: string;
  },
) {
  const database = await readDatabase();
  const currentRecord = database[id];

  if (!currentRecord) {
    return null;
  }

  const updatedRecord: StickerRecord = {
    ...currentRecord,
    premiumStatus: payload.premiumStatus,
    premiumError: payload.premiumError,
    cleanFileName: payload.cleanFileName ?? currentRecord.cleanFileName,
  };

  database[id] = updatedRecord;
  await writeDatabase(database);
  return updatedRecord;
}

export async function updateStripeSession(id: string, sessionId: string, paymentStatus = "unpaid") {
  const database = await readDatabase();
  const currentRecord = database[id];

  if (!currentRecord) {
    return null;
  }

  database[id] = {
    ...currentRecord,
    stripeSessionId: sessionId,
    stripePaymentStatus: paymentStatus,
  };

  await writeDatabase(database);
  return database[id];
}

export async function readStickerImageFile(fileName: string) {
  await ensureStorage();
  return readFile(path.join(generatedDir, fileName));
}

export async function readUploadFile(fileName: string) {
  await ensureStorage();
  return readFile(path.join(uploadsDir, fileName));
}

export function getImageFileName(record: StickerRecord, variant: StickerVariant) {
  return variant === "preview" ? record.previewFileName : record.cleanFileName;
}
