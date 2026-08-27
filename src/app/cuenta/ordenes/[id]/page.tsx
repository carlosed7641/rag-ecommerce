import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderWithItems } from "@/lib/orders";
import { OrderReceipt } from "@/components/orders/OrderReceipt";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  shipped: "Enviada",
  cancelled: "Cancelada",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderWithItems(id);

  // RLS ya impide leer órdenes ajenas — si no aparece, no existe o no es tuya.
  if (!result) notFound();
  const { order, items } = result;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:px-8">
      <Link href="/cuenta" className="mb-8 inline-block font-mono text-xs text-muted hover:text-copper">
        ← Volver a mi cuenta
      </Link>

      <div className="mb-2 flex items-center gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Orden #{order.id.slice(0, 8)}
        </h1>
        <span className="font-mono text-xs text-signal">
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>
      <p className="mb-9 font-mono text-xs text-muted">
        {new Date(order.created_at).toLocaleDateString("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <OrderReceipt order={order} items={items} />
    </div>
  );
}
