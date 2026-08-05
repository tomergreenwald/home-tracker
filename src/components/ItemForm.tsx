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
}: {
  categories: Category[];
  providers: Provider[];
  initialItem?: Item;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      categoryId: String(form.get("categoryId") ?? ""),
      providerId: String(form.get("providerId") ?? ""),
      providerFreeText: String(form.get("providerFreeText") ?? ""),
      accountOrPolicyNumber: String(form.get("accountOrPolicyNumber") ?? ""),
      owner: String(form.get("owner") ?? ""),
      amount: form.get("amount") ? Number(form.get("amount")) : undefined,
      billingFrequency: form.get("billingFrequency") as BillingFrequency,
      startDate: String(form.get("startDate") ?? ""),
      renewalOrEndDate: String(form.get("renewalOrEndDate") ?? ""),
      status: form.get("status") as ItemStatus,
      notes: String(form.get("notes") ?? ""),
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

      <div className="grid grid-cols-2 gap-4">
        <Field label="מספר חשבון / פוליסה">
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

      <div className="grid grid-cols-2 gap-4">
        <Field label="סכום (₪)">
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initialItem?.amount}
            className="input"
          />
        </Field>
        <Field label="תדירות חיוב">
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
