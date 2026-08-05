import { z } from "zod";

export const billingFrequencySchema = z.enum([
  "monthly",
  "annual",
  "one_time",
  "other",
]);

export const itemStatusSchema = z.enum(["draft", "verified", "needs_review"]);

// בסיס בלי .default() על אף שדה. חשוב: אם billingFrequency/status היו
// עם .default(), אז itemInputSchema.partial() בנתיב ה-PATCH היה ממלא אותם
// אוטומטית בברירת המחדל בכל עדכון חלקי שלא כולל את השדה הזה - ומאפס בטעות
// סטטוס/תדירות קיימים (למשל "טויב ואומת" הופך בשקט ל"טיוטה"). לכן הדיפולטים
// מוגדרים רק ב-itemCreateSchema (עבור POST), לא כאן.
export const itemInputSchema = z.object({
  name: z.string().trim().min(1, "חובה להזין שם לפריט"),
  categoryId: z.string().trim().min(1, "חובה לבחור קטגוריה"),
  providerId: z.string().trim().optional().or(z.literal("")),
  providerFreeText: z.string().trim().optional().or(z.literal("")),
  accountOrPolicyNumber: z.string().trim().optional().or(z.literal("")),
  owner: z.string().trim().optional().or(z.literal("")),
  // יכול להיות שלילי בפריטי הכנסה (חודש עם יתרת חובה/קיזוז, למשל תלוש עם
  // ניכוי עודף מהחודש הקודם) - לא רק בפריטי הוצאה.
  amount: z.coerce.number().optional(),
  billingFrequency: billingFrequencySchema.optional(),
  startDate: z.string().trim().optional().or(z.literal("")),
  renewalOrEndDate: z.string().trim().optional().or(z.literal("")),
  status: itemStatusSchema.optional(),
  notes: z.string().trim().optional().or(z.literal("")),

  // שדות ייעודיים לפריטי הכנסה. גם הם יכולים להיות שליליים בחודשי תיקון/זיכוי
  // רטרואקטיבי בתלוש (למשל זיכוי מס, קיזוז ברוטו).
  employerName: z.string().trim().optional().or(z.literal("")),
  incomePeriod: z.string().trim().optional().or(z.literal("")),
  grossAmount: z.coerce.number().optional(),
  taxWithheld: z.coerce.number().optional(),
  nationalInsuranceEmployee: z.coerce.number().optional(),
  healthTax: z.coerce.number().optional(),
  employeePensionContribution: z.coerce.number().optional(),
  employerPensionContribution: z.coerce.number().optional(),
  employeeHishtalmutContribution: z.coerce.number().optional(),
  employerHishtalmutContribution: z.coerce.number().optional(),
});

export type ItemInput = z.infer<typeof itemInputSchema>;

// שימוש ב-POST בלבד: כאן כן רוצים ברירת מחדל לפריט חדש שלא צוינו לו
// תדירות/סטטוס.
export const itemCreateSchema = itemInputSchema.extend({
  billingFrequency: billingFrequencySchema.default("monthly"),
  status: itemStatusSchema.default("draft"),
});
