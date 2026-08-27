import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products";
import { formatCurrency } from "@/lib/format";
import { AddToCartButton } from "@/components/product/AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
      <nav className="mb-8 font-mono text-xs text-muted">
        <Link href="/productos" className="hover:text-copper">
          Catálogo
        </Link>
        {product.categories && (
          <>
            {" / "}
            <Link
              href={`/productos?category=${product.categories.slug}`}
              className="hover:text-copper"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-14 md:grid-cols-2">
        <div
          className="aspect-square overflow-hidden rounded border border-line bg-bg bg-[length:16px_16px]"
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

        <div className="flex flex-col gap-5">
          {product.material && (
            <span className="font-mono text-[0.68rem] uppercase tracking-wider text-muted">
              {product.material}
            </span>
          )}
          <h1 className="break-words text-balance font-display text-3xl font-semibold text-ink">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl text-copper">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="font-mono text-base text-muted line-through">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>

          <p className="max-w-[52ch] text-muted">{product.description}</p>

          {product.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded border border-line px-2.5 py-1 font-mono text-[0.7rem] text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 border-t border-line pt-6">
            <AddToCartButton product={product} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-6 font-mono text-xs">
            <div>
              <dt className="text-muted">Envío</dt>
              <dd className="text-ink">24 horas</dd>
            </div>
            <div>
              <dt className="text-muted">Garantía</dt>
              <dd className="text-ink">2 años</dd>
            </div>
            <div>
              <dt className="text-muted">Devolución</dt>
              <dd className="text-ink">30 días</dd>
            </div>
            <div>
              <dt className="text-muted">Disponibilidad</dt>
              <dd className="text-ink">
                {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
