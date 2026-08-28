"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

export async function setUserRole(userId: string, role: "customer" | "admin") {
  const { user } = await requireAdmin();

  if (userId === user.id && role !== "admin") {
    throw new Error("No puedes quitarte tu propio rol de admin.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/usuarios");
}
