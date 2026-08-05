import Link from "next/link";
import type { Category, Item, Provider } from "@/lib/types";
import { formatILS, monthlyEquivalent } from "@/lib/labels";
import StatusBadge from "./StatusBadge";

export default function ItemsTable({
  items,
  categories,
  providers,
}: {
  items: Item[];
  categories: Category[];
  providers: Provider[];
}) {
  if (items.length === 0) {
    return (
      <p className="text-slate-500 text-sm py-8 text-center">
        אין עדיין פריטים בקטגוריה הזו.
      </p>
    );
  }

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const providerById = new Map(providers.map((p) => [p.id, p]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-right text-slate-500 border-b border-slate-200">
            <th className="py-2 pe-4 font-medium">שם</th>
            <th className="py-2 pe-4 font-medium">קטגוריה</th>
            <th className="py-2 pe-4 font-medium">ספק</th>
            <th className="py-2 pe-4 font-medium">סכום</th>
            <th className="py-2 pe-4 font-medium">סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const category = categoryById.get(item.categoryId);
            const provider = item.providerId
              ? providerById.get(item.providerId)
              : undefined;
            const monthly = monthlyEquivalent(
              item.amount,
              item.billingFrequency
            );
            return (
              <tr
                key={item.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="py-2 pe-4">
                  <Link
                    href={`/items/${item.id}`}
                    className="text-slate-900 font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                </td>
                <td className="py-2 pe-4 text-slate-600">
                  {category?.name ?? item.categoryId}
                </td>
                <td className="py-2 pe-4 text-slate-600">
                  {provider?.name ?? item.providerFreeText ?? "—"}
                </td>
                <td className="py-2 pe-4 text-slate-600">
                  {item.amount === undefined
                    ? "—"
                    : `${formatILS(item.amount)}${
                        monthly !== item.amount
                          ? ` (${formatILS(monthly)} לחודש)`
                          : ""
                      }`}
                </td>
                <td className="py-2 pe-4">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
