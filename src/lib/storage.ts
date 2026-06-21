import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

import { del, list, put } from "@vercel/blob";

import { StickerRecord, StickerVariant } from "@/lib/types";

const storageRoot = path.join(process.cwd(), "storage");
const uploadsDir = path.join(storageRoot, "uploads");
const generatedDir = path.join(storageRoot, "generated");
const dbPath = path.join(storageRoot, "figurinha-records.json");
const TEMP_FILE_TTL_MS = 24 * 60 * 60 * 1000;
const useBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

type StickerDatabase = Record<string, StickerRecord>;

function normalizeRecord(record: StickerRecord): StickerRecord {
  return {
    ...record,
    premiumStatus: record.premiumStatus ?? "not_started",
    premiumError: record.premiumError,
  };
}

function getRecordBlobPath(id: string) {
  return `records/${id}.json`;
}

function getUploadBlobPath(id: string, fileExtension: string) {
  return `uploads/${id}${fileExtension}`;
}

function getGeneratedBlobPath(id: string, variant: StickerVariant) {
  return `generated/${id}-${variant}.png`;
}

async function fetchBufferFromUrl(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Falha ao baixar blob ${url}.`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function fetchJsonFromUrl<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Falha ao ler registro ${url}.`);
  }

  return (await response.json()) as T;
}

async function findBlobByPath(pathname: string) {
  const { blobs } = await list({
    prefix: pathname,
    limit: 10,
  });

  return blobs.find((blob) => blob.pathname === pathname) ?? null;
}

async function putBlob(pathname: string, body: Buffer | string, contentType: string) {
  return put(pathname, body, {
    access: "public",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType,
  });
}

async function cleanupExpiredBlobRecords(records: StickerRecord[]) {
  const now = Date.now();

  for (const record of records) {
    const createdAt = new Date(record.createdAt).getTime();

    if (Number.isNaN(createdAt) || now - createdAt < TEMP_FILE_TTL_MS) {
      continue;
    }

    await Promise.all([
      del(record.photoFileName).catch(() => undefined),
      del(record.previewFileName).catch(() => undefined),
      del(record.cleanFileName).catch(() => undefined),
      del(getRecordBlobPath(record.id)).catch(() => undefined),
    ]);
  }
}

async function listAllBlobRecords() {
  const { blobs } = await list({
    prefix: "records/",
    limit: 1000,
  });

  const records = await Promise.all(
    blobs.map(async (blob) => normalizeRecord(await fetchJsonFromUrl<StickerRecord>(blob.url))),
  );

  await cleanupExpiredBlobRecords(records);

  return records.filter((record) => {
    const createdAt = new Date(record.createdAt).getTime();
    return !Number.isNaN(createdAt) && Date.now() - createdAt < TEMP_FILE_TTL_MS;
  });
}

async function getBlobRecord(id: string) {
  const blob = await findBlobByPath(getRecordBlobPath(id));

  if (!blob) {
    return null;
  }

  return normalizeRecord(await fetchJsonFromUrl<StickerRecord>(blob.url));
}

async function writeBlobRecord(record: StickerRecord) {
  await putBlob(getRecordBlobPath(record.id), JSON.stringify(record, null, 2), "application/json");
}

async function ensureLocalStorage() {
  await mkdir(uploadsDir, { recursive: true });
  await mkdir(generatedDir, { recursive: true });

  try {
    await readFile(dbPath, "utf8");
  } catch {
    await writeFile(dbPath, JSON.stringify({}, null, 2), "utf8");
  }
}

async function readLocalDatabase() {
  await ensureLocalStorage();
  const raw = await readFile(dbPath, "utf8");
  const database = JSON.parse(raw) as StickerDatabase;
  await cleanupExpiredLocalRecords(database);
  return database;
}

async function writeLocalDatabase(database: StickerDatabase) {
  await ensureLocalStorage();
  await writeFile(dbPath, JSON.stringify(database, null, 2), "utf8");
}

async function removeLocalFileIfExists(filePath: string) {
  try {
    await unlink(filePath);
  } catch {
    // Ignore missing files during background cleanup.
  }
}

async function cleanupExpiredLocalRecords(database: StickerDatabase) {
  const now = Date.now();
  let changed = false;

  for (const [id, record] of Object.entries(database)) {
    const createdAt = new Date(record.createdAt).getTime();

    if (Number.isNaN(createdAt) || now - createdAt < TEMP_FILE_TTL_MS) {
      continue;
    }

    changed = true;
    delete database[id];

    await Promise.all([
      removeLocalFileIfExists(path.join(uploadsDir, record.photoFileName)),
      removeLocalFileIfExists(path.join(generatedDir, record.previewFileName)),
      removeLocalFileIfExists(path.join(generatedDir, record.cleanFileName)),
    ]);
  }

  if (changed) {
    await writeLocalDatabase(database);
  }
}

async function updateLocalRecord(
  id: string,
  updater: (record: StickerRecord) => StickerRecord,
) {
  const database = await readLocalDatabase();
  const currentRecord = database[id];

  if (!currentRecord) {
    return null;
  }

  const updatedRecord = normalizeRecord(updater(currentRecord));
  database[id] = updatedRecord;
  await writeLocalDatabase(database);
  return updatedRecord;
}

async function updateBlobRecord(
  id: string,
  updater: (record: StickerRecord) => StickerRecord,
) {
  const currentRecord = await getBlobRecord(id);

  if (!currentRecord) {
    return null;
  }

  const updatedRecord = normalizeRecord(updater(currentRecord));
  await writeBlobRecord(updatedRecord);
  return updatedRecord;
}

export async function saveUploadFile(id: string, fileExtension: string, fileBuffer: Buffer) {
  if (useBlobStorage) {
    const blob = await putBlob(getUploadBlobPath(id, fileExtension), fileBuffer, "application/octet-stream");
    return blob.url;
  }

  await ensureLocalStorage();
  const fileName = `${id}${fileExtension}`;
  await writeFile(path.join(uploadsDir, fileName), fileBuffer);
  return fileName;
}

export async function saveGeneratedImages(id: string, images: { preview: Buffer; clean: Buffer }) {
  if (useBlobStorage) {
    const [previewBlob, cleanBlob] = await Promise.all([
      putBlob(getGeneratedBlobPath(id, "preview"), images.preview, "image/png"),
      putBlob(getGeneratedBlobPath(id, "clean"), images.clean, "image/png"),
    ]);

    return {
      previewFileName: previewBlob.url,
      cleanFileName: cleanBlob.url,
    };
  }

  await ensureLocalStorage();
  const previewFileName = `${id}-preview.png`;
  const cleanFileName = `${id}-clean.png`;

  await writeFile(path.join(generatedDir, previewFileName), images.preview);
  await writeFile(path.join(generatedDir, cleanFileName), images.clean);

  return { previewFileName, cleanFileName };
}

export async function overwriteCleanImage(id: string, cleanImageBuffer: Buffer) {
  if (useBlobStorage) {
    const blob = await putBlob(getGeneratedBlobPath(id, "clean"), cleanImageBuffer, "image/png");
    return blob.url;
  }

  await ensureLocalStorage();
  const cleanFileName = `${id}-clean.png`;
  await writeFile(path.join(generatedDir, cleanFileName), cleanImageBuffer);
  return cleanFileName;
}

export async function saveStickerRecord(record: StickerRecord) {
  if (useBlobStorage) {
    await writeBlobRecord(normalizeRecord(record));
    return;
  }

  const database = await readLocalDatabase();
  database[record.id] = normalizeRecord(record);
  await writeLocalDatabase(database);
}

export async function getStickerRecord(id: string) {
  if (useBlobStorage) {
    return getBlobRecord(id);
  }

  const database = await readLocalDatabase();
  const record = database[id];
  return record ? normalizeRecord(record) : null;
}

export async function getStickerBySessionId(sessionId: string) {
  if (useBlobStorage) {
    const records = await listAllBlobRecords();
    return records.find((record) => record.stripeSessionId === sessionId) ?? null;
  }

  const database = await readLocalDatabase();
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
  const updateRecord = useBlobStorage ? updateBlobRecord : updateLocalRecord;

  return updateRecord(id, (currentRecord) => ({
    ...currentRecord,
    paid: true,
    stripeSessionId: payload.stripeSessionId ?? currentRecord.stripeSessionId,
    stripePaymentStatus:
      payload.stripePaymentStatus ?? currentRecord.stripePaymentStatus ?? "paid",
  }));
}

export async function updatePremiumStatus(
  id: string,
  payload: {
    premiumStatus: StickerRecord["premiumStatus"];
    premiumError?: string;
    cleanFileName?: string;
  },
) {
  const updateRecord = useBlobStorage ? updateBlobRecord : updateLocalRecord;

  return updateRecord(id, (currentRecord) => ({
    ...currentRecord,
    premiumStatus: payload.premiumStatus,
    premiumError: payload.premiumError,
    cleanFileName: payload.cleanFileName ?? currentRecord.cleanFileName,
  }));
}

export async function updateStripeSession(id: string, sessionId: string, paymentStatus = "unpaid") {
  const updateRecord = useBlobStorage ? updateBlobRecord : updateLocalRecord;

  return updateRecord(id, (currentRecord) => ({
    ...currentRecord,
    stripeSessionId: sessionId,
    stripePaymentStatus: paymentStatus,
  }));
}

export async function readStickerImageFile(fileName: string) {
  if (useBlobStorage) {
    return fetchBufferFromUrl(fileName);
  }

  await ensureLocalStorage();
  return readFile(path.join(generatedDir, fileName));
}

export async function readUploadFile(fileName: string) {
  if (useBlobStorage) {
    return fetchBufferFromUrl(fileName);
  }

  await ensureLocalStorage();
  return readFile(path.join(uploadsDir, fileName));
}

export function getImageFileName(record: StickerRecord, variant: StickerVariant) {
  return variant === "preview" ? record.previewFileName : record.cleanFileName;
}
