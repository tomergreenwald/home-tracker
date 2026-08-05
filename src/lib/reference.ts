import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Category, Provider } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

export async function getCategories(): Promise<Category[]> {
  const raw = await readFile(
    path.join(DATA_DIR, "categories.seed.json"),
    "utf-8"
  );
  return JSON.parse(raw) as Category[];
}

export async function getProviders(): Promise<Provider[]> {
  const raw = await readFile(
    path.join(DATA_DIR, "providers.seed.json"),
    "utf-8"
  );
  return JSON.parse(raw) as Provider[];
}
