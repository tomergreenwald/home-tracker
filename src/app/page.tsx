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

  const totalMonthly = items.reduce(
    (sum, item) =>
      sum + monthlyEquivalent(item.amount, item.billingFrequency),
    0
  );
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
          סיכום כל החשבונות, הביטוחים, החיסכון והמנויים שמופו עד כה.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-slate-500 text-xs mb-1">עלות חודשית משוערת</p>
          <p className="text-2xl font-bold">{formatILS(totalMonthly)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-slate-500 text-xs mb-1">סה&quot;כ פריטים ממופים</p>
          <p className="text-2xl font-bold">{items.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-slate-500 text-xs mb-1">ממתינים לטיוב</p>
          <p className="text-2xl font-bold">{needsAttention.length}</p>
        </div>
      </div>

      {groupOrder.map((group) => {
        const groupCategoryIds = new Set(
          categories.filter((c) => c.group === group).map((c) => c.id)
        );
        const groupItems = items.filter((i) =>
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
