import { getCategories, getProviders } from "@/lib/reference";
import ItemForm from "@/components/ItemForm";

export default async function NewItemPage() {
  const [categories, providers] = await Promise.all([
    getCategories(),
    getProviders(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">הוספת פריט</h1>
      <ItemForm categories={categories} providers={providers} />
    </div>
  );
}
