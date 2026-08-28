import { notFound } from "next/navigation";
import { getOrderWithItems } from "@/lib/orders";
import { OrderReceipt } from "@/components/orders/OrderReceipt";
import { updateOrderStatus } from "@/app/admin/ordenes/actions";

const STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagada" },
  { value: "shipped", label: "Enviada" },
  { value: "cancelled", label: "Cancelada" },
];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderWithItems(id);
  if (!result) notFound();
  const { order, items } = result;

  const boundAction = updateOrderStatus.bind(null, id);
  const address = order.shipping_address as Record<string, string> | null;

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">
        Orden #{order.id.slice(0, 8)}
      </h1>
      <p className="mb-8 text-sm text-muted">
        {new Date(order.created_at).toLocaleString("es-CO")}
      </p>

      <form action={boundAction} className="mb-8 flex items-center gap-3">
        <label className="text-sm font-medium text-ink" htmlFor="status">
          Estado:
        </label>
        <select
          id="status"
          name="status"
          defaultValue={order.status}
          className="input w-auto"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-copper px-4 py-2 text-xs font-semibold text-white hover:bg-copper-ink"
        >
          Actualizar
        </button>
      </form>

      {address && (
        <div className="mb-8 rounded-lg border border-line bg-surface p-4 text-sm text-ink">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
            Dirección de envío
          </p>
          <p>{address.line1}</p>
          <p>
            {address.city}
            {address.state ? `, ${address.state}` : ""} · {address.zip}
          </p>
        </div>
      )}

      <OrderReceipt order={order} items={items} />
    </div>
  );
}
