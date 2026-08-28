"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/ordenes", label: "Órdenes" },
  { href: "/admin/cupones", label: "Cupones" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    // md+: sidebar fija (sticky) que no se mueve ni cambia de tamaño al
    // cambiar de tab — self-start evita que el flex la estire a la altura
    // del contenido. En mobile es una barra compacta arriba, con los links
    // en una fila con scroll horizontal (nunca se aprietan ni desbordan la
    // pantalla).
    <aside className="w-full flex-none md:sticky md:top-10 md:w-48 md:self-start">
      <div className="mb-3 flex items-center justify-between md:mb-6 md:block">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Panel admin
          </p>
          <p className="truncate text-sm font-semibold text-ink">{adminName}</p>
        </div>
        <Link
          href="/"
          className="flex-none text-xs font-medium text-muted hover:text-ink md:hidden"
        >
          ← Tienda
        </Link>
      </div>

      <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 text-sm md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "flex-none rounded-full bg-ink px-4 py-2 font-semibold whitespace-nowrap text-white"
                  : "flex-none rounded-full px-4 py-2 font-medium whitespace-nowrap text-muted hover:bg-surface hover:text-ink"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        className="mt-6 hidden text-sm font-medium text-muted hover:text-ink md:inline-block"
      >
        ← Volver a la tienda
      </Link>
    </aside>
  );
}
