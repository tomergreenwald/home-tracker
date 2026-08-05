import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getItem, UPLOADS_DIR } from "@/lib/store";

type RouteContext = { params: Promise<{ id: string; docId: string }> };

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".csv": "text/csv",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id, docId } = await params;
  const item = await getItem(id);
  const doc = item?.documents.find((d) => d.id === docId);
  if (!item || !doc) {
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  }

  const ext = path.extname(doc.storedAs).toLowerCase();
  const filePath = path.join(UPLOADS_DIR, id, doc.storedAs);
  const buffer = await readFile(filePath);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(
        doc.filename
      )}"`,
    },
  });
}
