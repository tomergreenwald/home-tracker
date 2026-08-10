import path from "node:path";
import { NextResponse } from "next/server";
import { getItem, readDocumentFile } from "@/lib/store";

type RouteContext = { params: Promise<{ id: string; docId: string }> };

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".csv": "text/csv",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
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
  const buffer = await readDocumentFile(id, doc.storedAs);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(
        doc.filename
      )}"`,
    },
  });
}
