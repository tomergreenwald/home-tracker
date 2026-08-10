export default function AuthErrorPage() {
  return (
    <div className="max-w-md mx-auto mt-24 text-center px-4">
      <div className="text-4xl mb-4">🔒</div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">אין הרשאה</h1>
      <p className="text-slate-600">
        חשבון ה-Google הזה לא ברשימת המשתמשים המורשים לצפות באתר הזה.
      </p>
    </div>
  );
}
