import { NextResponse } from "next/server";
import { z } from "zod";
import { itemCreateSchema } from "@/lib/schemas";
import { createItem, listItems } from "@/lib/store";
import { isReadOnly } from "@/lib/readOnly";

export async function GET() {
  const items = await listItems();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (isReadOnly()) {
    return NextResponse.json({ error: "אתר בקריאה-בלבד" }, { status: 403 });
  }
  const body = await request.json();
  const parsed = itemCreateSchema.safeParse(body);
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
    employerName: data.employerName || undefined,
    incomePeriod: data.incomePeriod || undefined,
    grossAmount: data.grossAmount,
    taxWithheld: data.taxWithheld,
    nationalInsuranceEmployee: data.nationalInsuranceEmployee,
    healthTax: data.healthTax,
    employeePensionContribution: data.employeePensionContribution,
    employerPensionContribution: data.employerPensionContribution,
    employeeHishtalmutContribution: data.employeeHishtalmutContribution,
    employerHishtalmutContribution: data.employerHishtalmutContribution,
  });
  return NextResponse.json(item, { status: 201 });
}
