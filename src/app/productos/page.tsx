import Link from "next/link";
import { listProducts, getCategories, type ProductFilters } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";

type SearchParams = {
  category?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? "1") || 1;

  const filters: ProductFilters = {
    categorySlug: sp.category,
    minPrice: sp.min ? Math.max(0, Number(sp.min)) : undefined,
    maxPrice: sp.max ? Math.max(0, Number(sp.max)) : undefined,
    sort:
      sp.sort === "precio_asc" || sp.sort === "precio_desc" ? sp.sort : "recientes",
    page,
  };

  const [{ products, total, pageSize }, categories] = await Promise.all([
    listProducts(filters),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(overrides: Partial<SearchParams>) {
    const params = new URLSearchParams({
      ...(sp.category ? { category: sp.category } : {}),
      ...(sp.min ? { min: sp.min } : {}),
      ...(sp.max ? { max: sp.max } : {}),
      ...(sp.sort ? { sort: sp.sort } : {}),
      ...(sp.page ? { page: sp.page } : {}),
      ...overrides,
    });
    // limpia claves vacías
    for (const [k, v] of [...params.entries()]) if (!v) params.delete(k);
    const qs = params.toString();
    return qs ? `/productos?${qs}` : "/productos";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Catálogo</h1>
        <span className="font-mono text-sm text-muted">
          {total} producto{total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid gap-10 md:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-8">
          <div>
            <h2 className="mb-3 font-mono text-[0.68rem] uppercase tracking-wider text-muted">
              Categoría
            </h2>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href={pageHref({ category: undefined, page: undefined })}
                  className={
                    !sp.category
                      ? "font-semibold text-copper"
                      : "text-ink hover:text-copper"
                  }
                >
                  Todas
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={pageHref({ category: c.slug, page: undefined })}
                    className={
                      sp.category === c.slug
                        ? "font-semibold text-copper"
                        : "text-ink hover:text-copper"
                    }
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <form className="flex flex-col gap-3" action="/productos" method="GET">
            {sp.category && (
              <input type="hidden" name="category" value={sp.category} />
            )}
            {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
            <h2 className="font-mono text-[0.68rem] uppercase tracking-wider text-muted">
              Rango de precio (COP)
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="min"
                min={0}
                defaultValue={sp.min}
                placeholder="Mín"
                className="w-full rounded border border-line-strong bg-surface px-2.5 py-1.5 font-mono text-sm text-ink outline-none focus:border-copper"
              />
              <span className="text-muted">–</span>
              <input
                type="number"
                name="max"
                min={0}
                defaultValue={sp.max}
                placeholder="Máx"
                className="w-full rounded border border-line-strong bg-surface px-2.5 py-1.5 font-mono text-sm text-ink outline-none focus:border-copper"
              />
            </div>
            <button
              type="submit"
              className="rounded border border-line-strong px-3 py-1.5 font-mono text-xs text-ink hover:border-copper hover:text-copper"
            >
              Aplicar
            </button>
          </form>
        </aside>

        <div>
          <div className="mb-6 flex justify-end">
            <form action="/productos" method="GET" className="flex items-center gap-2">
              {sp.category && (
                <input type="hidden" name="category" value={sp.category} />
              )}
              {sp.min && <input type="hidden" name="min" value={sp.min} />}
              {sp.max && <input type="hidden" name="max" value={sp.max} />}
              <label className="font-mono text-xs text-muted" htmlFor="sort">
                Ordenar
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sp.sort ?? "recientes"}
                className="rounded border border-line-strong bg-surface px-2 py-1.5 font-mono text-xs text-ink outline-none focus:border-copper"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
              </select>
              <button
                type="submit"
                className="rounded border border-line-strong px-2.5 py-1.5 font-mono text-xs text-ink hover:border-copper hover:text-copper"
              >
                Aplicar
              </button>
            </form>
          </div>

          {products.length === 0 ? (
            <p className="py-16 text-center text-muted">
              No encontramos productos con esos filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-7">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4 font-mono text-sm">
              <Link
                aria-disabled={page <= 1}
                href={pageHref({ page: String(page - 1) })}
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
                aria-disabled={page >= totalPages}
                href={pageHref({ page: String(page + 1) })}
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
        </div>
      </div>
    </div>
  );
}
