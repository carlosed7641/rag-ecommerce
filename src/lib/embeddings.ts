import { createAdminClient } from "@/lib/supabase/admin";

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MODEL = "voyage-3.5";
const BATCH_SIZE = 128;

type VoyageInputType = "document" | "query";

async function voyageEmbed(texts: string[], inputType: VoyageInputType) {
  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, input: texts, input_type: inputType }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Voyage AI error (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { data: { embedding: number[]; index: number }[] };
  // Voyage no garantiza el orden de vuelta, así que se reordena por index.
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

// Texto que se embebe por producto — el mismo shape que usa la query
// asimétrica del lado búsqueda (input_type "query" vs "document").
function productToText(p: {
  name: string;
  description: string | null;
  material: string | null;
  tags: string[];
  categoryName?: string | null;
}) {
  const parts = [
    p.name,
    p.description ?? "",
    p.material ? `Material: ${p.material}` : "",
    p.categoryName ? `Categoría: ${p.categoryName}` : "",
    p.tags.length ? `Tags: ${p.tags.join(", ")}` : "",
  ].filter(Boolean);
  return parts.join(". ");
}

/** Embebe una query de usuario para buscar contra match_products. */
export async function embedQuery(query: string) {
  const [embedding] = await voyageEmbed([query], "query");
  return embedding;
}

/**
 * Recalcula el embedding de todos los productos con embedding_updated_at
 * pendiente (null). Se llama desde /api/embeddings/sync — a mano, tras
 * crear/editar un producto en el CMS, o desde el script de backfill.
 */
export async function syncPendingEmbeddings() {
  const supabase = createAdminClient();

  const { data: pending, error } = await supabase
    .from("products")
    .select("id, name, description, material, tags, categories(name)")
    .is("embedding_updated_at", null);

  if (error) throw error;
  if (!pending || pending.length === 0) return { updated: 0 };

  let updated = 0;
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const texts = batch.map((p) =>
      productToText({
        name: p.name,
        description: p.description,
        material: p.material,
        tags: p.tags ?? [],
        categoryName: p.categories?.name,
      }),
    );
    const embeddings = await voyageEmbed(texts, "document");

    await Promise.all(
      batch.map((p, idx) =>
        supabase
          .from("products")
          .update({
            embedding: embeddings[idx] as unknown as string,
            embedding_updated_at: new Date().toISOString(),
          })
          .eq("id", p.id),
      ),
    );
    updated += batch.length;
  }

  return { updated };
}
