import { createClient } from "@/lib/supabase/server";

export async function getOrderWithItems(id: string, options?: { userId?: string }) {
  const supabase = await createClient();

  // Una sola consulta (orden + items embebidos) en vez de dos secuenciales:
  // evita un segundo viaje de ida y vuelta a Supabase antes de poder pintar la página.
  let query = supabase.from("orders").select("*, order_items(*)").eq("id", id);

  // Las páginas de cliente (confirmación, /cuenta/ordenes/[id]) pasan su
  // propio userId para filtrar explícitamente — no basta con RLS porque la
  // política de "orders" deja pasar también a los admins (para que /admin
  // pueda ver cualquier orden), y un cliente que además es admin no debe
  // ver órdenes ajenas al abrir sus propias páginas de cuenta. El panel de
  // admin llama a esta función sin userId a propósito.
  if (options?.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data: order } = await query.maybeSingle();

  if (!order) return null;

  const { order_items: items, ...orderFields } = order;
  return { order: orderFields, items: items ?? [] };
}
