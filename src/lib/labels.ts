import type {
  BillingFrequency,
  CategoryGroup,
  ItemStatus,
  ProviderType,
} from "./types";

export const groupLabels: Record<CategoryGroup, string> = {
  income: "הכנסות",
  banking: "בנקאות",
  savings_pension: "חיסכון ופנסיה",
  insurance: "ביטוח",
  subscription: "מנויים",
  utility: "עירייה ותשתיות",
};

export const groupOrder: CategoryGroup[] = [
  "income",
  "banking",
  "savings_pension",
  "insurance",
  "subscription",
  "utility",
];

/** קבוצות שהן "כסף שיוצא" (הוצאות) - הכל חוץ מהכנסות. */
export function isExpenseGroup(group: CategoryGroup): boolean {
  return group !== "income";
}

export const statusLabels: Record<ItemStatus, string> = {
  draft: "טיוטה",
  verified: "טויב ואומת",
  needs_review: "דורש בדיקה",
};

export const statusColors: Record<ItemStatus, string> = {
  draft: "bg-slate-200 text-slate-700",
  verified: "bg-emerald-100 text-emerald-800",
  needs_review: "bg-amber-100 text-amber-800",
};

export const billingFrequencyLabels: Record<BillingFrequency, string> = {
  monthly: "חודשי",
  annual: "שנתי",
  one_time: "חד פעמי",
  other: "אחר",
};

export const providerTypeLabels: Record<ProviderType, string> = {
  bank: "בנק",
  digital_bank: "בנק דיגיטלי",
  credit_card: "חברת אשראי",
  insurance: "חברת ביטוח",
  investment_house: "בית השקעות",
  health_fund: "קופת חולים",
  telecom: "סלולר",
  tv_streaming: "טלוויזיה / סטרימינג",
  internet: "אינטרנט",
  municipality: "רשות מקומית",
  utility: "תשתיות",
  government: "גוף ממשלתי",
  other: "אחר",
};

export function formatILS(amount: number | undefined): string {
  if (amount === undefined || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** מנרמל סכום לעלות חודשית משוערת, לפי תדירות החיוב. */
export function monthlyEquivalent(
  amount: number | undefined,
  frequency: BillingFrequency
): number {
  if (!amount) return 0;
  if (frequency === "annual") return amount / 12;
  if (frequency === "one_time") return 0;
  return amount;
}
