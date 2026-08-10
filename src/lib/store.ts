import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Item, ItemDocument, NewItemInput } from "./types";

// כל הנתונים האמיתיים של משק הבית נשמרים כאן, מקומית בלבד, כשמריצים על
// המחשב האישי (npm run dev / npm start). התיקייה data/local/ נמצאת
// ב-.gitignore ולא מגיעה ל-git לעולם.
const LOCAL_DIR = path.join(process.cwd(), "data", "local");
const ITEMS_FILE = path.join(LOCAL_DIR, "items.json");
export const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

// כשהאתר פרוס ב-Netlify (מצב קריאה-בלבד עבור בני המשפחה), אין דיסק מקומי
// קבוע - שם המידע נשמר ב-Netlify Blobs במקום. ראו scripts/sync-to-netlify.mjs
// לאופן שבו הנתונים מהמחשב המקומי מועלים ל-Blobs.
const DATA_BACKEND = process.env.DATA_BACKEND === "netlify-blobs" ? "netlify-blobs" : "local";
const BLOBS_ITEMS_STORE = "home-tracker-data";
const BLOBS_UPLOADS_STORE = "home-tracker-uploads";
const BLOBS_ITEMS_KEY = "items.json";

async function getBlobStore(name: string) {
  const { getStore } = await import("@netlify/blobs");
  // מחוץ לריצה בתוך Netlify (למשל מהסקריפט המקומי sync-to-netlify.mjs)
  // צריך להעביר siteID+token מפורשות. כשרץ בפועל בתוך Netlify זה אוטומטי.
  if (process.env.NETLIFY_BLOBS_SITE_ID && process.env.NETLIFY_BLOBS_TOKEN) {
    return getStore({
      name,
      siteID: process.env.NETLIFY_BLOBS_SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN,
    });
  }
  return getStore(name);
}

async function ensureLocalStore(): Promise<void> {
  await mkdir(LOCAL_DIR, { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await readFile(ITEMS_FILE, "utf-8");
  } catch {
    await writeFile(ITEMS_FILE, "[]\n", "utf-8");
  }
}

async function readItems(): Promise<Item[]> {
  if (DATA_BACKEND === "netlify-blobs") {
    const store = await getBlobStore(BLOBS_ITEMS_STORE);
    const items = await store.get(BLOBS_ITEMS_KEY, { type: "json" });
    return (items as Item[] | null) ?? [];
  }
  await ensureLocalStore();
  const raw = await readFile(ITEMS_FILE, "utf-8");
  return JSON.parse(raw) as Item[];
}

async function writeItems(items: Item[]): Promise<void> {
  if (DATA_BACKEND === "netlify-blobs") {
    const store = await getBlobStore(BLOBS_ITEMS_STORE);
    await store.setJSON(BLOBS_ITEMS_KEY, items);
    return;
  }
  await ensureLocalStore();
  await writeFile(ITEMS_FILE, JSON.stringify(items, null, 2) + "\n", "utf-8");
}

/** שומר קובץ מסמך מצורף (PDF/תמונה/וכו') לפריט - עוקף אוטומטית בין דיסק מקומי ל-Netlify Blobs. */
export async function writeDocumentFile(
  itemId: string,
  storedAs: string,
  buffer: Buffer
): Promise<void> {
  if (DATA_BACKEND === "netlify-blobs") {
    const store = await getBlobStore(BLOBS_UPLOADS_STORE);
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
    await store.set(`${itemId}/${storedAs}`, arrayBuffer);
    return;
  }
  const itemDir = path.join(UPLOADS_DIR, itemId);
  await mkdir(itemDir, { recursive: true });
  await writeFile(path.join(itemDir, storedAs), buffer);
}

/** קורא קובץ מסמך מצורף - עוקף אוטומטית בין דיסק מקומי ל-Netlify Blobs. */
export async function readDocumentFile(
  itemId: string,
  storedAs: string
): Promise<Buffer> {
  if (DATA_BACKEND === "netlify-blobs") {
    const store = await getBlobStore(BLOBS_UPLOADS_STORE);
    const data = await store.get(`${itemId}/${storedAs}`, {
      type: "arrayBuffer",
    });
    if (!data) throw new Error("קובץ לא נמצא");
    return Buffer.from(data);
  }
  return readFile(path.join(UPLOADS_DIR, itemId, storedAs));
}

export async function listItems(): Promise<Item[]> {
  const items = await readItems();
  return items.sort((a, b) => a.name.localeCompare(b.name, "he"));
}

export async function getItem(id: string): Promise<Item | undefined> {
  const items = await readItems();
  return items.find((item) => item.id === id);
}

export async function createItem(input: NewItemInput): Promise<Item> {
  const items = await readItems();
  const now = new Date().toISOString();
  const item: Item = {
    ...input,
    id: randomUUID(),
    status: input.status ?? "draft",
    documents: [],
    createdAt: now,
    updatedAt: now,
  };
  items.push(item);
  await writeItems(items);
  return item;
}

export async function updateItem(
  id: string,
  patch: Partial<NewItemInput>
): Promise<Item | undefined> {
  const items = await readItems();
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return undefined;
  items[idx] = {
    ...items[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeItems(items);
  return items[idx];
}

export async function deleteItem(id: string): Promise<boolean> {
  const items = await readItems();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  await writeItems(next);
  return true;
}

export async function addDocument(
  itemId: string,
  doc: Omit<ItemDocument, "id" | "uploadedAt">
): Promise<Item | undefined> {
  const items = await readItems();
  const idx = items.findIndex((item) => item.id === itemId);
  if (idx === -1) return undefined;
  const document: ItemDocument = {
    ...doc,
    id: randomUUID(),
    uploadedAt: new Date().toISOString(),
  };
  items[idx].documents.push(document);
  items[idx].updatedAt = document.uploadedAt;
  await writeItems(items);
  return items[idx];
}
