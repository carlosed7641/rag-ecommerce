import Link from "next/link";
import { getFeaturedProducts, getBestSellers } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";

export default async function HomePage() {
  const [featured, bestSellers] = await Promise.all([
    getFeaturedProducts(4),
    getBestSellers(4),
  ]);

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-16 px-4 pb-22 pt-18 md:grid-cols-2 md:items-center md:px-8">
        <div>
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-signal">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            Catálogo 2026
          </div>
          <h1 className="mb-5 break-words text-balance text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">
            Tecnología con hoja de especificaciones.
          </h1>
          <p className="mb-8 max-w-[46ch] text-lg text-muted">
            Audio, cómputo, hogar inteligente, gaming y fotografía. Cada
            producto con sus specs claras, sin relleno de marketing.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/productos"
              className="rounded-full bg-copper px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-copper-ink"
            >
              Ver catálogo →
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="grid w-full grid-cols-2 gap-3 rounded-2xl bg-surface p-3">
            {featured.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/productos/${p.slug}`}
                aria-label={p.name}
                className="aspect-square overflow-hidden rounded-xl transition-opacity hover:opacity-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 md:px-8">
          <SpecItem k="Envío" v="24 horas" />
          <SpecItem k="Garantía" v="2 años" />
          <SpecItem k="Devolución" v="30 días" />
          <SpecItem k="Soporte" v="7 días / semana" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-22 md:px-8">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-2xl font-extrabold text-ink">Recién llegados</h2>
          <Link href="/productos" className="text-sm font-semibold text-copper hover:text-copper-ink">
            Ver todo el catálogo →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-7">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-22 md:px-8">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-2xl font-extrabold text-ink">Más vendidos</h2>
            <Link href="/productos" className="text-sm font-semibold text-copper hover:text-copper-ink">
              Ver todo el catálogo →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-7">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SpecItem({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        {k}
      </span>
      <span className="text-sm font-semibold text-ink">{v}</span>
    </div>
  );
}
