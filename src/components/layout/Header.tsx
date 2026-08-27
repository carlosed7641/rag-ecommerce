import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { CartBadge } from "@/components/layout/CartBadge";

export function Header() {
  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 md:h-19 md:flex-nowrap md:px-8 md:py-0">
        <Link
          href="/"
          className="order-1 font-display text-xl font-bold tracking-tight text-ink"
        >
          RagTech
        </Link>

        <Link
          href="/carrito"
          className="order-2 ml-auto flex-none whitespace-nowrap rounded-[3px] border border-line-strong px-2.5 py-1.5 font-mono text-[0.8rem] text-ink hover:border-copper hover:text-copper md:order-4 md:ml-0"
        >
          CARRITO (<CartBadge />)
        </Link>

        <div className="order-4 w-full basis-full md:order-2 md:w-auto md:basis-auto md:flex md:flex-1 md:justify-center">
          <SearchBar />
        </div>

        <nav className="order-5 flex w-full basis-full justify-center gap-4 text-sm text-muted md:order-3 md:w-auto md:basis-auto md:justify-start md:gap-8">
          <Link href="/productos" className="hover:text-copper">
            Catálogo
          </Link>
          <Link href="/cuenta" className="hover:text-copper">
            Cuenta
          </Link>
        </nav>
      </div>
    </header>
  );
}
