"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  billingFrequencyLabels,
  groupLabels,
  groupOrder,
  statusLabels,
} from "@/lib/labels";
import type {
  BillingFrequency,
  Category,
  Item,
  ItemStatus,
  Provider,
} from "@/lib/types";

export default function ItemForm({
  categories,
  providers,
  initialItem,
  readOnly = false,
}: {
  categories: Category[];
  providers: Provider[];
  initialItem?: Item;
  /** אתר מקוון בקריאה-בלבד (למשל הפריסה ב-Netlify) - כל השדות מוצגים אך לא ניתנים לעריכה. */
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(initialItem?.categoryId ?? "");

  const isIncome =
    categories.find((c) => c.id === categoryId)?.group === "income";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const numberOrUndefined = (field: string) =>
      form.get(field) ? Number(form.get(field)) : undefined;

    const payload = {
      name: String(form.get("name") ?? ""),
      categoryId: String(form.get("categoryId") ?? ""),
      providerId: String(form.get("providerId") ?? ""),
      providerFreeText: String(form.get("providerFreeText") ?? ""),
      accountOrPolicyNumber: String(form.get("accountOrPolicyNumber") ?? ""),
      owner: String(form.get("owner") ?? ""),
      amount: numberOrUndefined("amount"),
      billingFrequency: form.get("billingFrequency") as BillingFrequency,
      startDate: String(form.get("startDate") ?? ""),
      renewalOrEndDate: String(form.get("renewalOrEndDate") ?? ""),
      status: form.get("status") as ItemStatus,
      notes: String(form.get("notes") ?? ""),
      employerName: String(form.get("employerName") ?? ""),
      incomePeriod: String(form.get("incomePeriod") ?? ""),
      grossAmount: numberOrUndefined("grossAmount"),
      taxWithheld: numberOrUndefined("taxWithheld"),
      nationalInsuranceEmployee: numberOrUndefined("nationalInsuranceEmployee"),
      healthTax: numberOrUndefined("healthTax"),
      employeePensionContribution: numberOrUndefined(
        "employeePensionContribution"
      ),
      employerPensionContribution: numberOrUndefined(
        "employerPensionContribution"
      ),
      employeeHishtalmutContribution: numberOrUndefined(
        "employeeHishtalmutContribution"
      ),
      employerHishtalmutContribution: numberOrUndefined(
        "employerHishtalmutContribution"
      ),
    };

    try {
      const res = await fetch(
        initialItem ? `/api/items/${initialItem.id}` : "/api/items",
        {
          method: initialItem ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ? JSON.stringify(body.error) : "שגיאה בשמירה");
      }
      const saved = await res.json();
      router.push(`/items/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירה");
    } finally {
      setSubmitting(false);
    }
  }

  const categoriesByGroup = groupOrder.map((group) => ({
    group,
    categories: categories.filter((c) => c.group === group),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {error && (
        <p className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {readOnly && (
        <p className="bg-amber-50 text-amber-800 text-sm rounded-md px-3 py-2">
          🔒 אתר בקריאה-בלבד - לא ניתן לערוך כאן. עריכה מתבצעת רק מהמחשב
          המקומי (npm run dev).
        </p>
      )}

      <fieldset disabled={readOnly} className="space-y-5">

      <Field label="שם הפריט *">
        <input
          name="name"
          required
          defaultValue={initialItem?.name}
          placeholder='למשל: "עו"ש הפועלים - תומר"'
          className="input"
        />
      </Field>

      <Field label="קטגוריה *">
        <select
          name="categoryId"
          required
          defaultValue={initialItem?.categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="input"
        >
          <option value="" disabled>
            בחרו קטגוריה
          </option>
          {categoriesByGroup.map(({ group, categories: cats }) => (
            <optgroup key={group} label={groupLabels[group]}>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      {isIncome ? (
        <Field label="שם מעסיק">
          <input
            name="employerName"
            defaultValue={initialItem?.employerName}
            className="input"
          />
        </Field>
      ) : (
        <>
          <Field label="ספק / מוסד">
            <select
              name="providerId"
              defaultValue={initialItem?.providerId ?? ""}
              className="input"
            >
              <option value="">לא ברשימה / לא רלוונטי</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="ספק בטקסט חופשי (אם לא ברשימה)">
            <input
              name="providerFreeText"
              defaultValue={initialItem?.providerFreeText}
              className="input"
            />
          </Field>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field
          label={
            isIncome ? "מספר תלוש / אסמכתא" : "מספר חשבון / פוליסה"
          }
        >
          <input
            name="accountOrPolicyNumber"
            defaultValue={initialItem?.accountOrPolicyNumber}
            className="input"
          />
        </Field>
        <Field label="בעלים (בן/בת משפחה)">
          <input name="owner" defaultValue={initialItem?.owner} className="input" />
        </Field>
      </div>

      {isIncome && (
        <Field label='תקופה (למשל "2026-01" לתלוש, "2025" לטופס 106)'>
          <input
            name="incomePeriod"
            defaultValue={initialItem?.incomePeriod}
            placeholder="2026-01"
            className="input"
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label={isIncome ? "נטו לתשלום (₪) *" : "סכום (₪)"}>
          <input
            name="amount"
            type="number"
            step="0.01"
            min={isIncome ? undefined : "0"}
            defaultValue={initialItem?.amount}
            className="input"
          />
        </Field>
        <Field label="תדירות">
          <select
            name="billingFrequency"
            defaultValue={initialItem?.billingFrequency ?? "monthly"}
            className="input"
          >
            {Object.entries(billingFrequencyLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {isIncome && (
        <div className="space-y-4 border border-slate-200 rounded-md p-4">
          <p className="text-sm font-medium text-slate-700">
            פירוט מתלוש / טופס 106
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="שכר ברוטו (₪)">
              <input
                name="grossAmount"
                type="number"
                step="0.01"
                defaultValue={initialItem?.grossAmount}
                className="input"
              />
            </Field>
            <Field label="מס הכנסה שנוכה (₪)">
              <input
                name="taxWithheld"
                type="number"
                step="0.01"
                defaultValue={initialItem?.taxWithheld}
                className="input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ביטוח לאומי שנוכה (₪)">
              <input
                name="nationalInsuranceEmployee"
                type="number"
                step="0.01"
                defaultValue={initialItem?.nationalInsuranceEmployee}
                className="input"
              />
            </Field>
            <Field label="מס בריאות שנוכה (₪)">
              <input
                name="healthTax"
                type="number"
                step="0.01"
                defaultValue={initialItem?.healthTax}
                className="input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="הפקדת עובד לפנסיה (₪)">
              <input
                name="employeePensionContribution"
                type="number"
                step="0.01"
                defaultValue={initialItem?.employeePensionContribution}
                className="input"
              />
            </Field>
            <Field label="הפקדת מעביד לפנסיה (₪)">
              <input
                name="employerPensionContribution"
                type="number"
                step="0.01"
                defaultValue={initialItem?.employerPensionContribution}
                className="input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="הפקדת עובד לקרן השתלמות (₪)">
              <input
                name="employeeHishtalmutContribution"
                type="number"
                step="0.01"
                defaultValue={initialItem?.employeeHishtalmutContribution}
                className="input"
              />
            </Field>
            <Field label="הפקדת מעביד לקרן השתלמות (₪)">
              <input
                name="employerHishtalmutContribution"
                type="number"
                step="0.01"
                defaultValue={initialItem?.employerHishtalmutContribution}
                className="input"
              />
            </Field>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="תאריך התחלה">
          <input
            name="startDate"
            type="date"
            defaultValue={initialItem?.startDate}
            className="input"
          />
        </Field>
        <Field label="תאריך חידוש / סיום">
          <input
            name="renewalOrEndDate"
            type="date"
            defaultValue={initialItem?.renewalOrEndDate}
            className="input"
          />
        </Field>
      </div>

      <Field label="סטטוס טיוב">
        <select
          name="status"
          defaultValue={initialItem?.status ?? "draft"}
          className="input"
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="הערות">
        <textarea
          name="notes"
          rows={3}
          defaultValue={initialItem?.notes}
          className="input"
        />
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="bg-slate-900 text-white px-5 py-2.5 rounded-md hover:bg-slate-800 disabled:opacity-50"
      >
        {submitting ? "שומר…" : initialItem ? "עדכון" : "הוספה"}
      </button>
      </fieldset>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
