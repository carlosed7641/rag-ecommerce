"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { couponSchema } from "@/lib/schemas/product";

export type CouponActionState = { error?: string } | null;

export async function createCoupon(
  _prev: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const maxUses = formData.get("maxUses");
  const expiresAt = formData.get("expiresAt");

  let input;
  try {
    input = couponSchema.parse({
      code: formData.get("code"),
      type: formData.get("type"),
      value: formData.get("value"),
      minSubtotal: formData.get("minSubtotal") || 0,
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt ? String(expiresAt) : null,
      isActive: formData.get("isActive") === "on",
    });
  } catch {
    return { error: "Revisa los campos del formulario." };
  }

  const { error } = await supabase.from("coupons").insert({
    code: input.code,
    type: input.type,
    value: input.value,
    min_subtotal: input.minSubtotal,
    max_uses: input.maxUses,
    expires_at: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
    is_active: input.isActive,
  });

  if (error) {
    return { error: error.code === "23505" ? "Ese código ya existe." : error.message };
  }

  revalidatePath("/admin/cupones");
  return null;
}

export async function toggleCoupon(couponId: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("coupons")
    .update({ is_active: isActive })
    .eq("id", couponId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cupones");
}

export async function deleteCoupon(couponId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", couponId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cupones");
}
