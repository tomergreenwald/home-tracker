import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { addDocument, getItem, writeDocumentFile } from "@/lib/store";
import { isReadOnly } from "@/lib/readOnly";

type RouteContext = { params: Promise<{ id: string }> };

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".csv",
  ".xlsx",
  ".xls",
  ".jpg",
  ".jpeg",
  ".png",
];

export async function POST(request: Request, { params }: RouteContext) {
  if (isReadOnly()) {
    return NextResponse.json({ error: "אתר בקריאה-בלבד" }, { status: 403 });
  }
  const { id } = await params;
  const item = await getItem(id);
  if (!item) {
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "חסר קובץ" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "הקובץ גדול מדי" }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `סוג קובץ לא נתמך (${ALLOWED_EXTENSIONS.join(", ")})` },
      { status: 400 }
    );
  }

  const storedAs = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeDocumentFile(id, storedAs, buffer);

  const updated = await addDocument(id, {
    filename: file.name,
    storedAs,
  });

  return NextResponse.json(updated, { status: 201 });
}
