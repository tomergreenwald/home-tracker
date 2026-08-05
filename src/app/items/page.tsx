import Link from "next/link";
import { getCategories, getProviders } from "@/lib/reference";
import { listItems } from "@/lib/store";
import { groupLabels, groupOrder, statusLabels } from "@/lib/labels";
import type { CategoryGroup, ItemStatus } from "@/lib/types";
import ItemsTable from "@/components/ItemsTable";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ group?: string; status?: string }>;

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [items, categories, providers] = await Promise.all([
    listItems(),
    getCategories(),
    getProviders(),
  ]);

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const filtered = items.filter((item) => {
    const category = categoryById.get(item.categoryId);
    if (params.group && category?.group !== params.group) return false;
    if (params.status && item.status !== params.status) return false;
    return true;
  });

  const buildHref = (group?: string, status?: string) => {
    const qs = new URLSearchParams();
    if (group) qs.set("group", group);
    if (status) qs.set("status", status);
    const query = qs.toString();
    return query ? `/items?${query}` : "/items";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">כל הפריטים</h1>
        <Link
          href="/items/new"
          className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-800"
        >
          + הוספת פריט
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href={buildHref(undefined, params.status)}
          className={`px-3 py-1 rounded-full border ${
            !params.group
              ? "bg-slate-900 text-white border-slate-900"
              : "border-slate-300 text-slate-600"
          }`}
        >
          הכל
        </Link>
        {groupOrder.map((group: CategoryGroup) => (
          <Link
            key={group}
            href={buildHref(group, params.status)}
            className={`px-3 py-1 rounded-full border ${
              params.group === group
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-300 text-slate-600"
            }`}
          >
            {groupLabels[group]}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href={buildHref(params.group, undefined)}
          className={`px-3 py-1 rounded-full border ${
            !params.status
              ? "bg-slate-100 border-slate-300"
              : "border-slate-200 text-slate-500"
          }`}
        >
          כל הסטטוסים
        </Link>
        {(Object.keys(statusLabels) as ItemStatus[]).map((status) => (
          <Link
            key={status}
            href={buildHref(params.group, status)}
            className={`px-3 py-1 rounded-full border ${
              params.status === status
                ? "bg-slate-100 border-slate-300"
                : "border-slate-200 text-slate-500"
            }`}
          >
            {statusLabels[status]}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <ItemsTable
          items={filtered}
          categories={categories}
          providers={providers}
        />
      </div>
    </div>
  );
}
