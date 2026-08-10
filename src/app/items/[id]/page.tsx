import { notFound } from "next/navigation";
import { getCategories, getProviders } from "@/lib/reference";
import { getItem } from "@/lib/store";
import { isReadOnly } from "@/lib/readOnly";
import ItemForm from "@/components/ItemForm";
import DocumentsUploader from "@/components/DocumentsUploader";
import DeleteItemButton from "@/components/DeleteItemButton";

export const dynamic = "force-dynamic";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, categories, providers] = await Promise.all([
    getItem(id),
    getCategories(),
    getProviders(),
  ]);

  if (!item) notFound();
  const readOnly = isReadOnly();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{item.name}</h1>
        {!readOnly && <DeleteItemButton itemId={item.id} />}
      </div>

      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <h2 className="font-semibold mb-4">פרטים</h2>
        <ItemForm
          categories={categories}
          providers={providers}
          initialItem={item}
          readOnly={readOnly}
        />
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <h2 className="font-semibold mb-3">מסמכים מצורפים</h2>
        <p className="text-slate-500 text-sm mb-3">
          למשל: דף פוליסה, אישור מ&quot;הר הביטוח&quot;, מסך מהאפליקציה של
          הבנק.
        </p>
        <DocumentsUploader
          itemId={item.id}
          documents={item.documents}
          readOnly={readOnly}
        />
      </section>
    </div>
  );
}
