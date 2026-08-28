"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { categorySchema } from "@/lib/schemas/product";

export type CategoryActionState = { error?: string } | null;

export async function createCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const parentId = String(formData.get("parentId") ?? "");
  let input;
  try {
    input = categorySchema.parse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      parentId: parentId || null,
    });
  } catch {
    return { error: "Revisa los campos del formulario." };
  }

  const { error } = await supabase.from("categories").insert({
    name: input.name,
    slug: input.slug,
    parent_id: input.parentId,
  });

  if (error) {
    return { error: error.code === "23505" ? "Ese slug ya existe." : error.message };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/productos");
  return null;
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categorias");
  revalidatePath("/productos");
}
