import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Item, ItemDocument, NewItemInput } from "./types";

// כל הנתונים האמיתיים של משק הבית נשמרים כאן, מקומית בלבד.
// התיקייה data/local/ נמצאת ב-.gitignore ולא מגיעה ל-git לעולם.
const LOCAL_DIR = path.join(process.cwd(), "data", "local");
const ITEMS_FILE = path.join(LOCAL_DIR, "items.json");
export const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

async function ensureStore(): Promise<void> {
  await mkdir(LOCAL_DIR, { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await readFile(ITEMS_FILE, "utf-8");
  } catch {
    await writeFile(ITEMS_FILE, "[]\n", "utf-8");
  }
}

async function readItems(): Promise<Item[]> {
  await ensureStore();
  const raw = await readFile(ITEMS_FILE, "utf-8");
  return JSON.parse(raw) as Item[];
}

async function writeItems(items: Item[]): Promise<void> {
  await ensureStore();
  await writeFile(ITEMS_FILE, JSON.stringify(items, null, 2) + "\n", "utf-8");
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
