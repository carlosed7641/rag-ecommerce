import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderWithItems } from "@/lib/orders";
import { OrderReceipt } from "@/components/orders/OrderReceipt";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderWithItems(id);

  if (!result) notFound();
  const { order, items } = result;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-8">
      <div className="mb-8 flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-wider text-signal">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
        Orden confirmada
      </div>
      <h1 className="mb-2 font-display text-2xl font-semibold text-ink">
        ¡Gracias por tu compra!
      </h1>
      <p className="mb-9 font-mono text-xs text-muted">
        Orden #{order.id.slice(0, 8)}
      </p>

      <OrderReceipt order={order} items={items} />

      <Link
        href="/cuenta"
        className="mt-10 inline-block font-mono text-sm text-copper hover:text-copper-ink"
      >
        Ver historial de órdenes →
      </Link>
    </div>
  );
}
