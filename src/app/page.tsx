import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";

export default async function HomePage() {
  const featured = await getFeaturedProducts(4);

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-16 px-4 pb-22 pt-18 md:px-8 md:grid-cols-2 md:items-center">
        <div>
          <div className="mb-5 flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-wider text-signal">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            Catálogo 2026
          </div>
          <h1 className="mb-5 break-words text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">
            Tecnología con hoja de especificaciones.
          </h1>
          <p className="mb-8 max-w-[46ch] text-lg text-muted">
            Audio, cómputo, hogar inteligente, gaming y fotografía. Cada
            producto con sus specs claras, sin relleno de marketing.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/productos"
              className="rounded border border-copper bg-copper px-6 py-3 text-sm font-semibold text-[#faf6f1] transition-colors hover:bg-copper-ink"
            >
              Ver catálogo →
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="grid w-full grid-cols-2 gap-2 rounded border border-line bg-surface p-2 md:gap-3 md:p-3">
            {featured.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/productos/${p.slug}`}
                aria-label={p.name}
                className="aspect-square overflow-hidden rounded-sm border border-line transition-opacity hover:opacity-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-5 px-4 py-6 md:px-8 md:grid-cols-4">
          <SpecItem k="Envío" v="24 horas" />
          <SpecItem k="Garantía" v="2 años" />
          <SpecItem k="Devolución" v="30 días" />
          <SpecItem k="Soporte" v="7 días / semana" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-22 md:px-8">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Recién llegados
          </h2>
          <Link href="/productos" className="font-mono text-sm text-copper hover:text-copper-ink">
            Ver todo el catálogo →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-7">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}

function SpecItem({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1 border-l border-line pl-5 first:border-l-0 first:pl-0">
      <span className="font-mono text-[0.68rem] uppercase tracking-wider text-muted">
        {k}
      </span>
      <span className="font-mono text-sm text-ink">{v}</span>
    </div>
  );
}
