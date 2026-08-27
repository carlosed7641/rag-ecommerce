import { createClient } from "@/lib/supabase/server";

export async function getOrderWithItems(id: string) {
  const supabase = await createClient();

  // Una sola consulta (orden + items embebidos) en vez de dos secuenciales:
  // evita un segundo viaje de ida y vuelta a Supabase antes de poder pintar la página.
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!order) return null;

  const { order_items: items, ...orderFields } = order;
  return { order: orderFields, items: items ?? [] };
}
