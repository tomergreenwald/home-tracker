import Link from "next/link";
import { isReadOnly } from "@/lib/readOnly";

const allLinks = [
  { href: "/", label: "דשבורד" },
  { href: "/items", label: "כל הפריטים" },
  { href: "/items/new", label: "הוספת פריט", editOnly: true },
  { href: "/providers", label: "מוסדות וספקים" },
];

export default function NavBar() {
  const readOnly = isReadOnly();
  const links = allLinks.filter((link) => !readOnly || !link.editOnly);
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
        <Link href="/" className="font-bold text-lg text-slate-900">
          🏠 מעקב בית{readOnly && <span className="text-xs font-normal text-amber-600 align-middle ms-1">(צפייה בלבד)</span>}
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
