import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group relative flex min-w-0 flex-col gap-2.5 rounded-[3px] border border-line bg-surface transition-colors hover:border-copper md:gap-3.5"
    >
      {/* Marcas de registro — firma visual de RagTech */}
      <span className="absolute -left-px -top-px h-2.5 w-2.5 border-l-[1.5px] border-t-[1.5px] border-line-strong transition-colors group-hover:border-copper" />
      <span className="absolute -right-px -top-px h-2.5 w-2.5 border-r-[1.5px] border-t-[1.5px] border-line-strong transition-colors group-hover:border-copper" />
      <span className="absolute -bottom-px -left-px h-2.5 w-2.5 border-b-[1.5px] border-l-[1.5px] border-line-strong transition-colors group-hover:border-copper" />
      <span className="absolute -bottom-px -right-px h-2.5 w-2.5 border-b-[1.5px] border-r-[1.5px] border-line-strong transition-colors group-hover:border-copper" />

      <div
        className="aspect-[4/3] overflow-hidden rounded-t-[3px] bg-bg bg-[length:14px_14px]"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-3 pb-3 md:gap-3.5 md:px-5 md:pb-5">
        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
          {product.material}
        </span>
        <h3 className="break-words font-display text-base font-semibold text-ink">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <span className="font-mono text-sm text-copper">
            {formatCurrency(product.price)}
          </span>
          {outOfStock ? (
            <span className="font-mono text-[0.65rem] text-muted">Agotado</span>
          ) : (
            <span className="flex items-center gap-1.5 font-mono text-[0.65rem] text-signal">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
              En stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
