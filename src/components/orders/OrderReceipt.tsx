import { formatCurrency } from "@/lib/format";
import type { Tables } from "@/lib/supabase/database.types";

type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;

/** Lista de productos + totales de una orden. Se usa tanto en la confirmación
 * de compra como en el detalle de orden dentro de /cuenta. */
export function OrderReceipt({ order, items }: { order: Order; items: OrderItem[] }) {
  return (
    <>
      <ul className="flex flex-col gap-2 border-y border-line py-6">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 text-sm">
            <span className="text-ink">
              {item.product_name} × {item.quantity}
            </span>
            <span className="text-muted">
              {formatCurrency(item.unit_price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Subtotal</span>
          <span className="text-ink">{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted">
              Descuento{order.coupon_code ? ` (${order.coupon_code})` : ""}
            </span>
            <span className="text-signal">−{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold">
          <span className="text-ink">Total</span>
          <span className="text-copper">{formatCurrency(order.total)}</span>
        </div>
      </div>
    </>
  );
}
