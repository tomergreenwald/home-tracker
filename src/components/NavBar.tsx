import Link from "next/link";

const links = [
  { href: "/", label: "דשבורד" },
  { href: "/items", label: "כל הפריטים" },
  { href: "/items/new", label: "הוספת פריט" },
  { href: "/providers", label: "מוסדות וספקים" },
];

export default function NavBar() {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
        <Link href="/" className="font-bold text-lg text-slate-900">
          🏠 מעקב בית
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
