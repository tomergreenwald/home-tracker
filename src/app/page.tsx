import Link from "next/link";
import { getCategories, getProviders } from "@/lib/reference";
import { listItems } from "@/lib/store";
import {
  formatILS,
  groupLabels,
  groupOrder,
  monthlyEquivalent,
} from "@/lib/labels";
import ItemsTable from "@/components/ItemsTable";

// הדאטה נשמרת בקבצים מקומיים ונקראת בכל בקשה — אין לקבע (prerender) בזמן build.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [items, categories, providers] = await Promise.all([
    listItems(),
    getCategories(),
    getProviders(),
  ]);

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const isIncomeItem = (categoryId: string) =>
    categoryById.get(categoryId)?.group === "income";

  const incomeItems = items.filter((i) => isIncomeItem(i.categoryId));
  const expenseItems = items.filter((i) => !isIncomeItem(i.categoryId));

  // תלושי משכורת הם תמונות מצב חודשיות (כל אחד = חודש שונה, לא חיוב חוזר),
  // אז "הכנסה חודשית" מחושבת כממוצע ביניהם ולא כסכום - אחרת נכפיל את ההכנסה
  // במספר החודשים שהוזנו.
  const monthlyIncomeItems = incomeItems.filter(
    (i) => i.billingFrequency === "monthly"
  );
  const avgMonthlyIncome = monthlyIncomeItems.length
    ? monthlyIncomeItems.reduce((sum, i) => sum + (i.amount ?? 0), 0) /
      monthlyIncomeItems.length
    : 0;
  const annualIncomeItems = incomeItems.filter(
    (i) => i.billingFrequency === "annual"
  );

  const totalMonthlyExpense = expenseItems.reduce(
    (sum, item) =>
      sum + monthlyEquivalent(item.amount, item.billingFrequency),
    0
  );
  const netCashFlow = avgMonthlyIncome - totalMonthlyExpense;
  const needsAttention = items.filter((i) => i.status !== "verified");

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-3">בואו נתחיל למפות את הבית</h1>
        <p className="text-slate-600 max-w-md mx-auto mb-6">
          עדיין אין פריטים. הוסיפו חשבון בנק, ביטוח, קרן פנסיה, מנוי או חשבון
          עירייה — לפי מה שיש לכם ביד (אפשר גם ייצוא מ&quot;הר הביטוח&quot;).
        </p>
        <Link
          href="/items/new"
          className="inline-block bg-slate-900 text-white px-5 py-2.5 rounded-md hover:bg-slate-800"
        >
          הוספת הפריט הראשון
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">דשבורד משק הבית</h1>
        <p className="text-slate-500 text-sm">
          סיכום כל ההכנסות, החשבונות, הביטוחים, החיסכון והמנויים שמופו עד כה.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-slate-500 text-xs mb-1">
            הכנסה חודשית ממוצעת (נטו)
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            {formatILS(avgMonthlyIncome)}
          </p>
          {monthlyIncomeItems.length > 0 && (
            <p className="text-slate-400 text-xs mt-1">
              ממוצע על פני {monthlyIncomeItems.length} תלושים
            </p>
          )}
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-slate-500 text-xs mb-1">הוצאה חודשית משוערת</p>
          <p className="text-2xl font-bold">{formatILS(totalMonthlyExpense)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-slate-500 text-xs mb-1">תזרים חודשי (נטו)</p>
          <p
            className={`text-2xl font-bold ${
              netCashFlow >= 0 ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {formatILS(netCashFlow)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-slate-500 text-xs mb-1">סה&quot;כ פריטים ממופים</p>
          <p className="text-2xl font-bold">{items.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-slate-500 text-xs mb-1">ממתינים לטיוב</p>
          <p className="text-2xl font-bold">{needsAttention.length}</p>
        </div>
      </div>

      {incomeItems.length > 0 && (
        <section className="bg-white border border-emerald-200 rounded-lg p-4">
          <div className="flex items-baseline justify-between mb-3 flex-wrap gap-1">
            <h2 className="font-semibold">{groupLabels.income}</h2>
            <span className="text-sm text-slate-500">
              {monthlyIncomeItems.length > 0 &&
                `${formatILS(avgMonthlyIncome)} ממוצע לחודש`}
              {monthlyIncomeItems.length > 0 &&
                annualIncomeItems.length > 0 &&
                " · "}
              {annualIncomeItems.length > 0 &&
                `${formatILS(
                  annualIncomeItems.reduce((s, i) => s + (i.amount ?? 0), 0)
                )} סה"כ שנתי (106)`}
              {" · "}
              {incomeItems.length} פריטים
            </span>
          </div>
          <ItemsTable
            items={incomeItems}
            categories={categories}
            providers={providers}
          />
        </section>
      )}

      {groupOrder
        .filter((group) => group !== "income")
        .map((group) => {
          const groupCategoryIds = new Set(
            categories.filter((c) => c.group === group).map((c) => c.id)
          );
          const groupItems = expenseItems.filter((i) =>
            groupCategoryIds.has(i.categoryId)
          );
          if (groupItems.length === 0) return null;
          const groupMonthly = groupItems.reduce(
            (sum, item) =>
              sum + monthlyEquivalent(item.amount, item.billingFrequency),
            0
          );
          return (
            <section
              key={group}
              className="bg-white border border-slate-200 rounded-lg p-4"
            >
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-semibold">{groupLabels[group]}</h2>
                <span className="text-sm text-slate-500">
                  {formatILS(groupMonthly)} לחודש · {groupItems.length} פריטים
                </span>
              </div>
              <ItemsTable
                items={groupItems}
                categories={categories}
                providers={providers}
              />
            </section>
          );
        })}
    </div>
  );
}
