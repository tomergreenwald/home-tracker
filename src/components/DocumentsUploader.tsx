"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ItemDocument } from "@/lib/types";

export default function DocumentsUploader({
  itemId,
  documents,
  readOnly = false,
}: {
  itemId: string;
  documents: ItemDocument[];
  /** אתר מקוון בקריאה-בלבד - מציג רק את רשימת המסמכים להורדה, בלי אפשרות העלאה. */
  readOnly?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/items/${itemId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "שגיאה בהעלאה");
      }
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהעלאה");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {documents.length > 0 && (
        <ul className="space-y-1 text-sm">
          {documents.map((doc) => (
            <li key={doc.id}>
              <a
                href={`/api/items/${itemId}/documents/${doc.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 hover:underline"
              >
                📎 {doc.filename}
              </a>
              <span className="text-slate-400 text-xs ms-2">
                {new Date(doc.uploadedAt).toLocaleDateString("he-IL")}
              </span>
            </li>
          ))}
        </ul>
      )}
      {documents.length === 0 && (
        <p className="text-slate-400 text-sm">אין עדיין מסמכים מצורפים.</p>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!readOnly && (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.csv,.jpg,.jpeg,.png"
            className="text-sm"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-sm hover:bg-slate-100 disabled:opacity-50"
          >
            {uploading ? "מעלה…" : "העלאה"}
          </button>
        </div>
      )}
    </div>
  );
}
