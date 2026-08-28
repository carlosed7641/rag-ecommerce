"use client";

import Link from "next/link";
import { useCartStore, useCartSubtotal } from "@/store/cart";
import { useIsClient } from "@/lib/useIsClient";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const isClient = useIsClient();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartSubtotal();

  if (!isClient) {
    // Evita parpadeo/mismatch mientras se lee localStorage
    return <div className="mx-auto max-w-4xl px-4 py-14 md:px-8" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
      <h1 className="mb-9 text-2xl font-extrabold text-ink">Carrito</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center text-muted">
          <p>Tu carrito está vacío.</p>
          <Link href="/productos" className="mt-3 inline-block font-semibold text-copper hover:text-copper-ink">
            Ver catálogo →
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-5 border-y border-line py-6">
            {items.map((item) => (
              <li key={item.productId} className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="flex min-w-[200px] flex-1 items-center gap-4">
                  <div className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-surface">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <Link href={`/productos/${item.slug}`} className="text-sm font-semibold text-ink hover:text-copper">
                      {item.name}
                    </Link>
                    <div className="mt-1 text-xs text-muted">
                      {formatCurrency(item.price)} c/u
                    </div>
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-4 sm:ml-0">
                  <div className="flex items-center rounded-full border border-line-strong">
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-sm text-ink hover:text-copper"
                      aria-label="Reducir cantidad"
                    >
                      −
                    </button>
                    <span className="min-w-[2ch] text-center text-sm text-ink">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-sm text-ink hover:text-copper"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                  <span className="min-w-[6ch] text-right text-sm font-semibold text-ink">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-xs text-muted hover:text-copper"
                    aria-label={`Quitar ${item.name}`}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-end gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="text-lg font-bold text-ink">{formatCurrency(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="rounded-full bg-copper px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-copper-ink"
            >
              Proceder al pago →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
