import { getProviders } from "@/lib/reference";
import { providerTypeLabels } from "@/lib/labels";
import type { ProviderType } from "@/lib/types";

const typeOrder: ProviderType[] = [
  "bank",
  "digital_bank",
  "credit_card",
  "investment_house",
  "insurance",
  "health_fund",
  "telecom",
  "tv_streaming",
  "internet",
  "utility",
  "municipality",
  "government",
  "other",
];

export default async function ProvidersPage() {
  const providers = await getProviders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">מוסדות וספקים</h1>
        <p className="text-slate-500 text-sm">
          רשימת ייחוס של הגופים המרכזיים בשוק הפיננסי והביטוחי הישראלי. מידע
          ציבורי, לא קשור לחשבונות שלכם. הרחבה על השוק נמצאת בקובץ{" "}
          <code className="bg-slate-100 rounded px-1">
            docs/israeli-financial-market.md
          </code>{" "}
          בריפו.
        </p>
      </div>

      {typeOrder.map((type) => {
        const list = providers.filter((p) => p.type === type);
        if (list.length === 0) return null;
        return (
          <section
            key={type}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <h2 className="font-semibold mb-3">{providerTypeLabels[type]}</h2>
            <ul className="flex flex-wrap gap-2 text-sm">
              {list.map((p) => (
                <li
                  key={p.id}
                  className="px-3 py-1 rounded-full bg-slate-100 text-slate-700"
                >
                  {p.name}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
