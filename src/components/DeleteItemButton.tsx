"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteItemButton({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("למחוק את הפריט הזה לצמיתות?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("שגיאה במחיקה");
      router.push("/items");
      router.refresh();
    } catch {
      setDeleting(false);
      alert("שגיאה במחיקה");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 text-sm hover:underline disabled:opacity-50"
    >
      {deleting ? "מוחק…" : "מחיקת פריט"}
    </button>
  );
}
