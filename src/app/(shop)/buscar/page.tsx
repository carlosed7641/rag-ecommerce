import Link from "next/link";
import { listProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Number(sp.page ?? "1") || 1;

  const { products, total, pageSize } = q
    ? await listProducts({ q, page })
    : { products: [], total: 0, pageSize: 12 };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
      <div className="mb-9">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Búsqueda
        </span>
        <h1 className="mt-2 break-words text-balance text-2xl font-extrabold text-ink">
          Resultados para &ldquo;{q}&rdquo;
        </h1>
        <p className="mt-1 text-sm text-muted">
          {total} producto{total === 1 ? "" : "s"} encontrado
          {total === 1 ? "" : "s"}
        </p>
      </div>

      {q.length === 0 ? (
        <p className="py-16 text-center text-muted">
          Escribe algo en el buscador para empezar.
        </p>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-muted">
          <p>No encontramos productos que coincidan con &ldquo;{q}&rdquo;.</p>
          <Link href="/productos" className="mt-3 inline-block text-copper hover:text-copper-ink">
            Ver todo el catálogo →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-7">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4 text-sm">
              <Link
                href={`/buscar?q=${encodeURIComponent(q)}&page=${page - 1}`}
                className={
                  page <= 1
                    ? "pointer-events-none text-muted/40"
                    : "text-ink hover:text-copper"
                }
              >
                ← Anterior
              </Link>
              <span className="text-muted">
                {page} / {totalPages}
              </span>
              <Link
                href={`/buscar?q=${encodeURIComponent(q)}&page=${page + 1}`}
                className={
                  page >= totalPages
                    ? "pointer-events-none text-muted/40"
                    : "text-ink hover:text-copper"
                }
              >
                Siguiente →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
