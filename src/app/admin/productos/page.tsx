import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("id, name, slug, price, stock, is_active, images")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: products, error } = await query;
  if (error) throw error;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-ink">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-copper px-5 py-2.5 text-sm font-semibold text-white hover:bg-copper-ink"
        >
          + Nuevo producto
        </Link>
      </div>

      <form className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre…"
          className="input max-w-xs"
        />
      </form>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line bg-surface text-left text-xs font-medium uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="flex items-center gap-3 font-medium text-ink hover:text-copper"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images?.[0]}
                      alt=""
                      className="h-10 w-10 flex-none rounded-md bg-surface object-cover"
                    />
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink">{formatCurrency(Number(p.price))}</td>
                <td className="px-4 py-3 text-ink">{p.stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.is_active
                        ? "rounded-full bg-signal/10 px-2.5 py-1 text-xs font-semibold text-signal"
                        : "rounded-full bg-muted/10 px-2.5 py-1 text-xs font-semibold text-muted"
                    }
                  >
                    {p.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteProductButton productId={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">
            No hay productos que coincidan.
          </p>
        )}
      </div>
    </div>
  );
}
