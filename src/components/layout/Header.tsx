import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { CartBadge } from "@/components/layout/CartBadge";

export function Header() {
  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 md:h-20 md:flex-nowrap md:px-8 md:py-0">
        <Link
          href="/"
          className="order-1 text-xl font-extrabold tracking-tight text-ink"
        >
          RagTech
        </Link>

        <Link
          href="/carrito"
          className="order-2 ml-auto flex-none whitespace-nowrap rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink hover:border-copper hover:text-copper md:order-4 md:ml-0"
        >
          Carrito (<CartBadge />)
        </Link>

        <div className="order-4 w-full basis-full md:order-2 md:w-auto md:basis-auto md:flex md:flex-1 md:justify-center">
          <SearchBar />
        </div>

        <nav className="order-5 flex w-full basis-full justify-center gap-6 text-sm font-medium text-muted md:order-3 md:w-auto md:basis-auto md:justify-start">
          <Link href="/productos" className="hover:text-ink">
            Catálogo
          </Link>
          <Link href="/cuenta" className="hover:text-ink">
            Cuenta
          </Link>
        </nav>
      </div>
    </header>
  );
}
