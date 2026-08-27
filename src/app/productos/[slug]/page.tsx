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
      <nav className="mb-8 text-sm text-muted">
        <Link href="/productos" className="hover:text-ink">
          Catálogo
        </Link>
        {product.categories && (
          <>
            {" / "}
            <Link
              href={`/productos?category=${product.categories.slug}`}
              className="hover:text-ink"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-14 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-5">
          {product.material && (
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {product.material}
            </span>
          )}
          <h1 className="break-words text-balance text-3xl font-extrabold text-ink">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-ink">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-base text-muted line-through">
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
                  className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 border-t border-line pt-6">
            <AddToCartButton product={product} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-muted">Envío</dt>
              <dd className="font-semibold text-ink">24 horas</dd>
            </div>
            <div>
              <dt className="text-muted">Garantía</dt>
              <dd className="font-semibold text-ink">2 años</dd>
            </div>
            <div>
              <dt className="text-muted">Devolución</dt>
              <dd className="font-semibold text-ink">30 días</dd>
            </div>
            <div>
              <dt className="text-muted">Disponibilidad</dt>
              <dd className="font-semibold text-ink">
                {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
