import type { ItemStatus } from "@/lib/types";
import { statusColors, statusLabels } from "@/lib/labels";

export default function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
