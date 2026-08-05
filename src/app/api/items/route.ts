import { NextResponse } from "next/server";
import { z } from "zod";
import { itemInputSchema } from "@/lib/schemas";
import { createItem, listItems } from "@/lib/store";

export async function GET() {
  const items = await listItems();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = itemInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const item = await createItem({
    name: data.name,
    categoryId: data.categoryId,
    providerId: data.providerId || undefined,
    providerFreeText: data.providerFreeText || undefined,
    accountOrPolicyNumber: data.accountOrPolicyNumber || undefined,
    owner: data.owner || undefined,
    amount: data.amount,
    billingFrequency: data.billingFrequency,
    startDate: data.startDate || undefined,
    renewalOrEndDate: data.renewalOrEndDate || undefined,
    status: data.status,
    notes: data.notes || undefined,
  });
  return NextResponse.json(item, { status: 201 });
}
