import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrderWithItems } from "@/lib/orders";
import { OrderReceipt } from "@/components/orders/OrderReceipt";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const result = await getOrderWithItems(id, { userId: user.id });

  if (!result) notFound();
  const { order, items } = result;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-8">
      <div className="mb-8 flex items-center gap-2 text-sm font-medium text-signal">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
        Orden confirmada
      </div>
      <h1 className="mb-2 text-2xl font-extrabold text-ink">
        ¡Gracias por tu compra!
      </h1>
      <p className="mb-9 text-sm text-muted">Orden #{order.id.slice(0, 8)}</p>

      <OrderReceipt order={order} items={items} />

      <Link
        href="/cuenta"
        className="mt-10 inline-block text-sm font-semibold text-copper hover:text-copper-ink"
      >
        Ver historial de órdenes →
      </Link>
    </div>
  );
}
