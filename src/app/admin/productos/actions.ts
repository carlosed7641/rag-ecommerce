"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { productSchema } from "@/lib/schemas/product";
import { syncPendingEmbeddings } from "@/lib/embeddings";

// Fire-and-forget: no bloquea el redirect del form ni falla la mutación si
// Voyage AI está caído. Si algo sale mal, el producto queda con
// embedding_updated_at = null y el próximo sync (o el cron) lo recoge.
function triggerEmbeddingSync() {
  syncPendingEmbeddings().catch((err) => {
    console.error("[embeddings] sync falló tras guardar producto:", err);
  });
}

export type ProductActionState = { error?: string } | null;

function parseFormData(formData: FormData) {
  const rawTags = String(formData.get("tags") ?? "");
  const rawImages = String(formData.get("images") ?? "");
  const compareAt = formData.get("compareAtPrice");
  const categoryId = String(formData.get("categoryId") ?? "");

  return productSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    compareAtPrice: compareAt ? Number(compareAt) : null,
    categoryId: categoryId || null,
    material: formData.get("material") || undefined,
    tags: rawTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    images: rawImages
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean),
    stock: formData.get("stock"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();
  const supabase = await createClient();

  let input;
  try {
    input = parseFormData(formData);
  } catch {
    return { error: "Revisa los campos del formulario." };
  }

  const { error } = await supabase.from("products").insert({
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    category_id: input.categoryId,
    material: input.material ?? null,
    tags: input.tags,
    images: input.images,
    stock: input.stock,
    is_active: input.isActive,
  });

  if (error) {
    return {
      error: error.code === "23505" ? "Ese slug ya existe." : error.message,
    };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  triggerEmbeddingSync();
  redirect("/admin/productos");
}

export async function updateProduct(
  productId: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();
  const supabase = await createClient();

  let input;
  try {
    input = parseFormData(formData);
  } catch {
    return { error: "Revisa los campos del formulario." };
  }

  // Si cambia contenido relevante para el chat (Fase 4), se marca el
  // embedding como desactualizado para que el job de sync lo recalcule.
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      price: input.price,
      compare_at_price: input.compareAtPrice ?? null,
      category_id: input.categoryId,
      material: input.material ?? null,
      tags: input.tags,
      images: input.images,
      stock: input.stock,
      is_active: input.isActive,
      embedding_updated_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    return {
      error: error.code === "23505" ? "Ese slug ya existe." : error.message,
    };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  triggerEmbeddingSync();
  redirect("/admin/productos");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}
