#!/usr/bin/env node
// מעלה את הנתונים המקומיים (data/local/items.json + data/uploads/) ל-Netlify
// Blobs, כדי שהאתר המקוון (בקריאה-בלבד) יציג את אותם הנתונים.
//
// שימוש:
//   NETLIFY_BLOBS_SITE_ID=xxx NETLIFY_BLOBS_TOKEN=yyy node scripts/sync-to-netlify.mjs
//
// SITE_ID: נמצא ב-Netlify → Site configuration → General → Site details → Site ID
// TOKEN: Netlify → User settings → Applications → New access token

import { getStore } from "@netlify/blobs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ITEMS_FILE = path.join(ROOT, "data", "local", "items.json");
const UPLOADS_DIR = path.join(ROOT, "data", "uploads");

const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
const token = process.env.NETLIFY_BLOBS_TOKEN;

if (!siteID || !token) {
  console.error(
    "❌ חסרים NETLIFY_BLOBS_SITE_ID ו/או NETLIFY_BLOBS_TOKEN. ראו הערות בראש הקובץ."
  );
  process.exit(1);
}

function store(name) {
  return getStore({ name, siteID, token });
}

async function syncItems() {
  const raw = await readFile(ITEMS_FILE, "utf-8");
  const items = JSON.parse(raw);
  await store("home-tracker-data").setJSON("items.json", items);
  console.log(`✅ הועלו ${items.length} פריטים ל-items.json`);
}

async function syncUploads() {
  const uploadsStore = store("home-tracker-uploads");
  let itemDirs;
  try {
    itemDirs = await readdir(UPLOADS_DIR, { withFileTypes: true });
  } catch {
    console.log("ℹ️  אין תיקיית data/uploads מקומית - מדלג.");
    return;
  }
  let count = 0;
  for (const dirent of itemDirs) {
    if (!dirent.isDirectory()) continue;
    const itemId = dirent.name;
    const itemDir = path.join(UPLOADS_DIR, itemId);
    const files = await readdir(itemDir, { withFileTypes: true });
    for (const file of files) {
      if (!file.isFile()) continue;
      const buffer = await readFile(path.join(itemDir, file.name));
      await uploadsStore.set(`${itemId}/${file.name}`, buffer);
      count++;
    }
  }
  console.log(`✅ הועלו ${count} קבצים מצורפים`);
}

await syncItems();
await syncUploads();
console.log("🎉 סנכרון הושלם.");
