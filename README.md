# home-tracker 🏠

מיפוי וניהול של כל חשבונות הבנק, הביטוחים, החיסכון (פנסיה/גמל/השתלמות)
והמנויים של משק הבית.

הפרויקט בנוי בשלבים:

1. **מיפוי השוק** — רקע על איך השוק הפיננסי/ביטוחי הישראלי בנוי, ואיפה
   אפשר לשלוף עליו מידע. ראו [`docs/israeli-financial-market.md`](docs/israeli-financial-market.md).
2. **הזנת נתונים** (השלב הנוכחי) — אפליקציית web מקומית להזנה ידנית של
   כל פריט (חשבון בנק, כרטיס אשראי, פוליסת ביטוח, קרן פנסיה, מנוי וכו'),
   כולל העלאת מסמכים תומכים (PDF/CSV/תמונה).
3. **טיוב** — כל פריט מסומן בסטטוס `טיוטה` / `דורש בדיקה` / `טויב ואומת`,
   כדי לעקוב אחרי איזה מידע כבר אומת מול המקור (למשל "הר הביטוח" או דף
   חשבון מהבנק) ואיזה עוד לא.

שלב עתידי אפשרי: חיבור אוטומטי לחשבונות (למשל דרך
[`israeli-bank-scrapers`](https://github.com/eshaham/israeli-bank-scrapers))
— לא מומש כרגע, ויידרש דיון נפרד על איך שומרים credentials בבטחה.

## ⚠️ נתונים אישיים — מקומי בלבד

כל הנתונים האמיתיים (חשבונות, פוליסות, סכומים, מסמכים שהועלו) נשמרים
בקבצים תחת `data/local/` ו-`data/uploads/`. שתי התיקיות האלה ב-`.gitignore`
ולעולם לא מגיעות ל-git / GitHub. **אין להסיר אותן מה-.gitignore.**

הקבצים היחידים תחת `data/` שנמצאים בגיט הם `*.seed.json` — רשימת ייחוס
ציבורית ולא רגישה של בנקים/חברות ביטוח/ספקים ישראליים.

### ⚠️ הדיסק של סשן Claude Code כאן הוא זמני!

אם עובדים על הפרויקט הזה דרך סשן ענן זמני (Claude Code on the web) —
הדיסק המקומי **לא נשמר** בין סשנים; הקונטיינר מתאפס אחרי חוסר פעילות או
בסוף השיחה. `data/local/` ו-`data/uploads/` ייעלמו איתו.

**גיבוי/שחזור:**
1. בסוף עבודה (או מתישהו לפני שהסשן נגמר): `tar czf backup.tar.gz data/local data/uploads` ולשלוח את הקובץ למשתמש (`SendUserFile`) כדי שישמור אותו בעצמו (למשל ב-Google Drive).
2. בתחילת סשן חדש: לבקש מהמשתמש את קובץ הגיבוי האחרון, ולחלץ אותו חזרה:
   `tar xzf backup.tar.gz -C .` (דורס את `data/local/` ו-`data/uploads/` הריקים בחזרה למצב האחרון).

חשוב: אין לנסות "להקליד מחדש" תוכן גדול (JSON/base64) כדי להעלות אותו
לשירות חיצוני (כמו Drive) — זה לא אמין (יכול לשבש טקסט בהיקפים גדולים).
`tar`/`gzip`/`base64` דרך Bash הם מכניים ואמינים; שחזור טקסט דרך generation
של המודל - לא.

## הרצה מקומית

```bash
npm install
npm run dev
```

האפליקציה עולה על [http://localhost:3000](http://localhost:3000).

- **דשבורד** (`/`) — סיכום עלות חודשית ופילוח לפי קטגוריות.
- **כל הפריטים** (`/items`) — רשימה מלאה עם סינון לפי קטגוריה/סטטוס.
- **הוספת פריט** (`/items/new`) — טופס הזנה ידנית.
- **מוסדות וספקים** (`/providers`) — רשימת הייחוס של השוק הישראלי.

## פריסה מקוונת לקריאה-בלבד (Netlify)

לצפייה מהנייד (למשל גם עבור בן/בת הזוג), אפשר לפרוס גרסה **קריאה-בלבד**
(אי אפשר להוסיף/לערוך/למחוק דרכה) עם התחברות ב-Google, מוגבלת לרשימת
דוא"ל סגורה. עריכת הנתונים בפועל תמיד נשארת רק דרך `npm run dev` המקומי.

**איך זה עובד:**
- הרצה מקומית: קבצים ב-`data/local/` (בדיוק כמו היום, לא משתנה).
- הרצה ב-Netlify: `DATA_BACKEND=netlify-blobs` + `READ_ONLY=true` -
  הנתונים נשמרים ב-[Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)
  (לא בדיסק, כי לפונקציות ב-Netlify אין דיסק קבוע), וכל עריכה חסומה
  גם ב-UI וגם ב-API.
- כדי לעדכן את מה שמוצג באתר המקוון אחרי שמעדכנים נתונים מקומית, מריצים:
  `npm run sync:netlify` (דורש `NETLIFY_BLOBS_SITE_ID` + `NETLIFY_BLOBS_TOKEN`, ראו `.env.example`).

### שלבי הקמה חד-פעמיים

1. **Google Cloud Console** (https://console.cloud.google.com/apis/credentials):
   - צרו OAuth 2.0 Client ID מסוג "Web application".
   - Authorized redirect URI: `https://<שם-האתר>.netlify.app/api/auth/callback/google`.
   - שמרו את ה-Client ID וה-Client Secret.
2. **Netlify**:
   - New site → Import from GitHub → הריפו הזה.
   - Environment variables (Site configuration → Environment variables):
     - `READ_ONLY=true`
     - `DATA_BACKEND=netlify-blobs`
     - `AUTH_GOOGLE_ID=<מ-Google Cloud>`
     - `AUTH_GOOGLE_SECRET=<מ-Google Cloud>`
     - `AUTH_SECRET=<אקראי, למשל פלט של: openssl rand -base64 32>`
     - `AUTH_URL=https://<שם-האתר>.netlify.app`
     - `ALLOWED_EMAILS=<דוא"ל 1>,<דוא"ל 2>` (בדיוק כתובות ה-Gmail שיתחברו)
   - Deploy.
3. **סנכרון נתונים** (מהמחשב המקומי, אחרי שהאתר פרוס):
   - Netlify → Site configuration → General → Site details → מעתיקים את ה-**Site ID**.
   - Netlify → User settings → Applications → **New access token**.
   - `NETLIFY_BLOBS_SITE_ID=<Site ID> NETLIFY_BLOBS_TOKEN=<token> npm run sync:netlify`

## מבנה הפרויקט

```
data/
  categories.seed.json   # קטגוריות (עו"ש, ביטוח רכב, קרן השתלמות...) — בגיט
  providers.seed.json    # ספקים/מוסדות ישראליים — בגיט, מידע ציבורי
  local/                 # הנתונים האמיתיים שלכם — NOT in git
  uploads/                # מסמכים שהועלו — NOT in git
src/
  app/                    # עמודי Next.js (App Router) + API routes
  components/             # רכיבי UI
  lib/                    # מודל נתונים, שכבת אחסון, עזרי תצוגה
docs/
  israeli-financial-market.md  # רקע על השוק הפיננסי/ביטוחי הישראלי
```

## טכנולוגיה

Next.js (App Router) + TypeScript + Tailwind CSS. אחסון בקבצי JSON מקומיים
(ללא מסד נתונים חיצוני) — מתאים לשימוש פרטי של משק בית יחיד.
