import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type Product = Tables<"products">;
export type Category = Tables<"categories">;

export type ProductFilters = {
  categorySlug?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "recientes" | "precio_asc" | "precio_desc";
  page?: number;
  pageSize?: number;
};

const PAGE_SIZE_DEFAULT = 12;

export async function getFeaturedProducts(limit = 4) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function listProducts(filters: ProductFilters = {}) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? PAGE_SIZE_DEFAULT;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // categories!inner fuerza el join cuando hay que filtrar por su slug
  let query = filters.categorySlug
    ? supabase
        .from("products")
        .select("*, categories!inner(name, slug)", { count: "exact" })
        .eq("categories.slug", filters.categorySlug)
    : supabase.from("products").select("*, categories(name, slug)", { count: "exact" });

  if (filters.q) {
    query = query.or(`name.ilike.%${filters.q}%,material.ilike.%${filters.q}%`);
  }
  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  switch (filters.sort) {
    case "precio_asc":
      query = query.order("price", { ascending: true });
      break;
    case "precio_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { products: data, total: count ?? 0, page, pageSize };
}

export async function getBestSellers(limit = 4) {
  const supabase = await createClient();

  const { data: sold, error } = await supabase.rpc("get_best_sellers", {
    result_limit: limit,
  });
  if (error) throw error;

  // Si todavía hay pocas ventas reales, se rellena con otros productos
  // activos para que la sección nunca se vea vacía o a medias.
  if (sold.length >= limit) return sold;

  const excludeIds = sold.map((p) => p.id);
  const { data: filler, error: fillerError } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(limit - sold.length + excludeIds.length);
  if (fillerError) throw fillerError;

  const padding = filler.filter((p) => !excludeIds.includes(p.id)).slice(0, limit - sold.length);
  return [...sold, ...padding];
}

export async function getPriceBounds() {
  const supabase = await createClient();
  const [{ data: minRow }, { data: maxRow }] = await Promise.all([
    supabase.from("products").select("price").order("price", { ascending: true }).limit(1).maybeSingle(),
    supabase.from("products").select("price").order("price", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return {
    min: minRow ? Math.floor(minRow.price / 1000) * 1000 : 0,
    max: maxRow ? Math.ceil(maxRow.price / 1000) * 1000 : 1000000,
  };
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
