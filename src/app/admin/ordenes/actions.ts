"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

const VALID_STATUSES = ["pending", "paid", "shipped", "cancelled"] as const;

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const status = String(formData.get("status"));
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    throw new Error("Estado inválido.");
  }

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/ordenes/${orderId}`);
  revalidatePath("/admin/ordenes");
  revalidatePath("/admin");
}
