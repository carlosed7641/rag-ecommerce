import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-lg bg-surface transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-4 py-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {product.material}
        </span>
        <h3 className="break-words font-semibold text-ink">{product.name}</h3>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-bold text-ink">
            {formatCurrency(product.price)}
          </span>
          {outOfStock ? (
            <span className="text-xs text-muted">Agotado</span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-signal">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
              En stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
