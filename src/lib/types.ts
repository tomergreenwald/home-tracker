// מודל הנתונים של home-tracker.
// ראו docs/israeli-financial-market.md להסבר על השוק שמאחורי המודל הזה.

export type ProviderType =
  | "bank"
  | "digital_bank"
  | "credit_card"
  | "insurance"
  | "investment_house" // בית השקעות / חברה מנהלת (פנסיה/גמל/השתלמות)
  | "health_fund" // קופת חולים
  | "telecom"
  | "tv_streaming"
  | "internet"
  | "municipality"
  | "utility" // חשמל / גז / מים
  | "government"
  | "other";

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  website?: string;
  notes?: string;
}

export type CategoryGroup =
  | "banking"
  | "savings_pension"
  | "insurance"
  | "subscription"
  | "utility";

export interface Category {
  id: string;
  name: string;
  group: CategoryGroup;
  suggestedProviderTypes: ProviderType[];
}

/**
 * draft         - הוזן אבל עוד לא נבדק מול המקור (בנק/הר הביטוח וכו')
 * verified      - טויב ואומת מול מקור רשמי
 * needs_review  - יש ספק/פערי מידע, צריך לבדוק שוב
 */
export type ItemStatus = "draft" | "verified" | "needs_review";

export type BillingFrequency = "monthly" | "annual" | "one_time" | "other";

export interface ItemDocument {
  id: string;
  filename: string;
  storedAs: string;
  uploadedAt: string;
  note?: string;
}

export interface Item {
  id: string;
  name: string;
  categoryId: string;
  providerId?: string;
  providerFreeText?: string;
  accountOrPolicyNumber?: string;
  owner?: string;
  amount?: number;
  billingFrequency: BillingFrequency;
  startDate?: string;
  renewalOrEndDate?: string;
  status: ItemStatus;
  notes?: string;
  documents: ItemDocument[];
  createdAt: string;
  updatedAt: string;
}

export type NewItemInput = Omit<
  Item,
  "id" | "documents" | "createdAt" | "updatedAt" | "status"
> & {
  status?: ItemStatus;
};
