import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// שים לב: בגרסת Next.js הזו הקובץ נקרא proxy.ts (לא middleware.ts - זה שם
// ישן/מיושן). ראו node_modules/next/dist/docs/.../file-conventions/proxy.md.
//
// הגנת ההתחברות פעילה רק כשמוגדר ALLOWED_EMAILS (כלומר בפריסה לענן,
// כמו Netlify) - כדי שהרצה מקומית (npm run dev) תישאר פשוטה כרגיל וללא
// צורך בהגדרת Google OAuth רק כדי לפתח על המחשב האישי.
export default auth((req) => {
  if (!process.env.ALLOWED_EMAILS) {
    return;
  }
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/auth") || pathname === "/auth-error") {
    return;
  }
  if (!isLoggedIn) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
