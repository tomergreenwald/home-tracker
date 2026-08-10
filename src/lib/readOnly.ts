import "server-only";

/**
 * true כשהאתר רץ בפריסה מקוונת לקריאה-בלבד (Netlify) - כל עריכה/מחיקה/העלאה
 * חסומה, גם ב-API וגם ב-UI. הרצה מקומית (npm run dev) תמיד false.
 */
export function isReadOnly(): boolean {
  return process.env.READ_ONLY === "true";
}
