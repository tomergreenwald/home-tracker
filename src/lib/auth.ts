import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// רשימת הדוא"ל היחידה שמורשית להתחבר לאתר המקוון (רק צפייה).
// מוגדרת ב-env var ALLOWED_EMAILS, מופרדת בפסיקים - למשל:
// "tomerg@gmail.com,roni@example.com"
function getAllowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // בהרצה מקומית (npm run dev) אין ALLOWED_EMAILS ולכן ה-proxy כלל לא אוכף
  // התחברות - ה-secret כאן משמש רק כדי להשתיק אזהרה, לא לצורך אבטחה אמיתית.
  // בפרודקשן (Netlify) יש להגדיר AUTH_SECRET אמיתי (openssl rand -base64 32).
  secret: process.env.AUTH_SECRET || "local-dev-only-unused-secret",
  providers: [Google],
  pages: {
    // דף שגיאה מותאם - מוצג למשל כשמישהו מחוץ לרשימה המורשית מנסה להתחבר
    error: "/auth-error",
  },
  callbacks: {
    async signIn({ user }) {
      const allowed = getAllowedEmails();
      if (allowed.length === 0) {
        // הגנה נוספת: אם מישהו שוכח להגדיר ALLOWED_EMAILS בפרודקשן,
        // עדיף לחסום הכל מאשר להשאיר את האתר פתוח בטעות.
        return false;
      }
      const email = user.email?.toLowerCase();
      return !!email && allowed.includes(email);
    },
    async session({ session }) {
      return session;
    },
  },
});
