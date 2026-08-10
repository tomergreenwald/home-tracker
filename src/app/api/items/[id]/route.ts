import { NextResponse } from "next/server";
import { z } from "zod";
import { itemInputSchema } from "@/lib/schemas";
import type { NewItemInput } from "@/lib/types";
import { deleteItem, getItem, updateItem } from "@/lib/store";
import { isReadOnly } from "@/lib/readOnly";

// שדות טקסט אופציונליים שבטופס נשלחים כמחרוזת ריקה כדי "לנקות" אותם.
// אנחנו הופכים "" ל-undefined רק עבור שדות שבאמת נשלחו בבקשה - שדה שלא
// נשלח כלל לא אמור להיות מושפע (זה בדיוק הבאג שתוקן כאן: לפני כן כל
// PATCH חלקי היה דורס בשקט שדות קיימים שלא צוינו בבקשה, כי הקוד הישן
// כתב `field: data.field || undefined` על כולם ללא תנאי).
const CLEARABLE_TEXT_FIELDS = [
  "providerId",
  "providerFreeText",
  "accountOrPolicyNumber",
  "owner",
  "startDate",
  "renewalOrEndDate",
  "notes",
  "employerName",
  "incomePeriod",
] as const;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) {
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (isReadOnly()) {
    return NextResponse.json({ error: "אתר בקריאה-בלבד" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const parsed = itemInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const patch: Partial<NewItemInput> = { ...data };
  for (const key of CLEARABLE_TEXT_FIELDS) {
    // רק שדות שבאמת נשלחו בבקשה (גם אם ריקים) - לא נוגעים בשדות שנעדרים
    // מהגוף של הבקשה לגמרי.
    if (key in patch && patch[key] === "") {
      patch[key] = undefined;
    }
  }
  const item = await updateItem(id, patch);
  if (!item) {
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (isReadOnly()) {
    return NextResponse.json({ error: "אתר בקריאה-בלבד" }, { status: 403 });
  }
  const { id } = await params;
  const ok = await deleteItem(id);
  if (!ok) {
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
