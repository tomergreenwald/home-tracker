import { NextResponse } from "next/server";
import { z } from "zod";
import { itemInputSchema } from "@/lib/schemas";
import { deleteItem, getItem, updateItem } from "@/lib/store";

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
  const item = await updateItem(id, {
    ...data,
    providerId: data.providerId || undefined,
    providerFreeText: data.providerFreeText || undefined,
    accountOrPolicyNumber: data.accountOrPolicyNumber || undefined,
    owner: data.owner || undefined,
    startDate: data.startDate || undefined,
    renewalOrEndDate: data.renewalOrEndDate || undefined,
    notes: data.notes || undefined,
    employerName: data.employerName || undefined,
    incomePeriod: data.incomePeriod || undefined,
  });
  if (!item) {
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const ok = await deleteItem(id);
  if (!ok) {
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
